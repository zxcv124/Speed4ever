import supabase from './client';
import getAbsDate from '../utils/getDate';
import { auth } from './auth';

const TABLES = {
    products: { table: 'products', idColumn: 'id' },
    cars: { table: 'cars', idColumn: 'id' },
    users: { table: 'users', idColumn: 'username' },
    cover: { table: 'cover', idColumn: 'id' }
};

const COMMENT_TABLES = {
    products: { table: 'product_comments', parentColumn: 'product_id' },
    cars: { table: 'car_comments', parentColumn: 'car_id' }
};

const createSnapshot = (id, data) => ({
    id,
    exists: () => Boolean(data),
    data: () => data || undefined
});

const createCollectionSnapshot = rows => ({
    docs: rows.map(row => ({
        id: row.id,
        data: () => fromDb(row)
    }))
});

const parsePath = path => {
    const parts = path.split('/').filter(Boolean);

    if (parts.length === 2 && TABLES[parts[0]]) {
        return { type: 'document', ...TABLES[parts[0]], id: parts[1] };
    }

    if (parts.length === 1 && TABLES[parts[0]]) {
        return { type: 'collection', ...TABLES[parts[0]] };
    }

    if (parts.length === 4 && parts[3] === 'comments' && COMMENT_TABLES[parts[0]]) {
        return {
            type: 'comments',
            ...COMMENT_TABLES[parts[0]],
            parentId: parts[1]
        };
    }

    throw Error(`Unsupported data path: ${path}`);
}

const fromDb = row => {
    if (!row) return row;

    const mapped = { ...row };
    if (mapped.display_name && !mapped.displayName) mapped.displayName = mapped.display_name;
    if (mapped.photo_url && !mapped.photoURL) mapped.photoURL = mapped.photo_url;
    if (mapped.phone_number && !mapped.phoneNumber) mapped.phoneNumber = mapped.phone_number;
    if (mapped.current_bid && !mapped.currentBid) mapped.currentBid = mapped.current_bid;
    if (mapped.expires_at && !mapped.expiresAt) mapped.expiresAt = mapped.expires_at;
    if (mapped.closed_at && !mapped.closedAt) mapped.closedAt = mapped.closed_at;
    return mapped;
}

const toDb = data => {
    const mapped = { ...data };
    if (mapped.displayName) {
        mapped.display_name = mapped.displayName;
        delete mapped.displayName;
    }
    if (mapped.photoURL) {
        mapped.photo_url = mapped.photoURL;
        delete mapped.photoURL;
    }
    if (mapped.phoneNumber) {
        mapped.phone_number = mapped.phoneNumber;
        delete mapped.phoneNumber;
    }
    if (mapped.currentBid) {
        mapped.current_bid = mapped.currentBid;
        delete mapped.currentBid;
    }
    if (mapped.expiresAt) {
        mapped.expires_at = mapped.expiresAt;
        delete mapped.expiresAt;
    }
    if (mapped.closedAt) {
        mapped.closed_at = mapped.closedAt;
        delete mapped.closedAt;
    }
    return mapped;
}

const withOwnerData = data => {
    const user = auth.currentUser;
    if (!user) throw Error('You need to login again.');

    const ownedData = { ...data, uid: user.uid, date: data.date || getAbsDate().getTime() };
    if (user.displayName) ownedData.displayName = user.displayName;
    return ownedData;
}

export const getDOC = async path => {
    const target = parsePath(path);
    if (target.type !== 'document') throw Error(`Expected document path: ${path}`);

    const { data, error } = await supabase
        .from(target.table)
        .select('*')
        .eq(target.idColumn, target.id)
        .maybeSingle();

    if (error) throw error;
    return createSnapshot(target.id, fromDb(data));
}

export const addDOC = async ({ path, ...data }) => {
    const target = parsePath(path);
    const payload = toDb(withOwnerData(data));

    if (target.type === 'comments') {
        payload[target.parentColumn] = target.parentId;
    }

    const { data: inserted, error } = await supabase
        .from(target.table)
        .insert(payload)
        .select('*')
        .single();

    if (error) throw error;
    return { id: inserted.id, data: () => fromDb(inserted) };
}

export const setDOC = async ({ path, merge = true, ...data }) => {
    const target = parsePath(path);
    if (target.type !== 'document') throw Error(`Expected document path: ${path}`);

    const payload = toDb(withOwnerData(data));
    payload[target.idColumn] = target.id;

    const query = supabase.from(target.table);
    const request = merge ? query.upsert(payload, { onConflict: target.idColumn }) : query.insert(payload);
    const { data: saved, error } = await request.select('*').single();

    if (error) throw error;
    return { id: saved[target.idColumn], data: () => fromDb(saved) };
}

export const queryCollection = async ({ path, filters = [], sortBy = 'date', maxLimit = 10, offset = 0 }) => {
    const target = parsePath(path);
    if (target.type !== 'collection') throw Error(`Expected collection path: ${path}`);

    let query = supabase
        .from(target.table)
        .select('*')
        .eq('status', 'Active');

    filters.forEach(({ prop, operator, value }) => {
        if (operator === '==') query = query.eq(prop, value);
        if (operator === '>=') query = query.gte(prop, value);
        if (operator === '<=') query = query.lte(prop, value);
    });

    query = query
        .order(sortBy, { ascending: false })
        .range(offset, offset + maxLimit - 1);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(fromDb);
}

export const getSnapShot = (path, cb, errcb) => {
    const target = parsePath(path);

    const load = () => {
        let query = supabase.from(target.table).select('*');
        if (target.type === 'comments') query = query.eq(target.parentColumn, target.parentId);
        query
            .order('date', { ascending: false })
            .then(({ data, error }) => {
                if (error) throw error;
                cb(createCollectionSnapshot((data || []).map(fromDb)));
            })
            .catch(errcb);
    };

    load();

    const channel = supabase
        .channel(`changes:${path}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: target.table,
            filter: target.type === 'comments' ? `${target.parentColumn}=eq.${target.parentId}` : undefined
        }, load)
        .subscribe();

    return () => supabase.removeChannel(channel);
}
