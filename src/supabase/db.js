import supabase, { isSupabaseConfigured } from './client';
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

const LOCAL_DB_STORAGE_KEY = 'speed4ever-local-guest-db';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

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

    if (parts.length === 3 && parts[2] === 'comments' && COMMENT_TABLES[parts[0]]) {
        return {
            type: 'comments',
            ...COMMENT_TABLES[parts[0]],
            parentId: parts[1]
        };
    }

    if (parts.length === 4 && parts[0] === 'products' && parts[2] === 'bids') {
        return {
            type: 'bid',
            table: 'product_bids',
            productId: parts[1],
            username: parts[3]
        };
    }

    throw Error(`Unsupported data path: ${path}`);
}

const getLocalNow = () => Date.now();

const createLocalId = prefix => `${prefix}-${window.crypto?.randomUUID?.() || getLocalNow()}`;

const createLocalDb = () => {
    const now = getLocalNow();
    return {
        users: [
            {
                username: 'guest',
                uid: 'local-guest',
                displayName: 'guest',
                display_name: 'guest',
                photoURL: '',
                photo_url: '',
                date: now
            },
            {
                username: 'speed4ever',
                uid: 'system',
                displayName: 'speed4ever',
                display_name: 'speed4ever',
                photoURL: '',
                photo_url: '',
                date: now
            }
        ],
        products: [
            {
                id: 'guest-demo-auction',
                uid: 'system',
                displayName: 'speed4ever',
                display_name: 'speed4ever',
                title: 'Guest test auction',
                qty: 1,
                model: 'Universal',
                price: 100,
                state: 'Used',
                shipping_cost: 'Free',
                shipping_method: 'By Land',
                location: 'UAE',
                duration: 30,
                description: 'Temporary local auction for guest testing while the hosted backend is not configured.',
                status: 'Active',
                images: [],
                date: now,
                expires_at: now + 30 * MS_PER_DAY
            }
        ],
        product_bids: [],
        product_comments: [],
        cars: [
            {
                id: 'guest-demo-blog',
                uid: 'system',
                displayName: 'speed4ever',
                display_name: 'speed4ever',
                owned_by: 'Speed4Ever',
                model_year: 2024,
                model: 'Guest tester',
                kilometers: 0,
                color: 'Black',
                country: 'UAE',
                facebook: '',
                instagram: '',
                twitter: '',
                snapchat: '',
                whatsapp: '',
                description: 'Temporary local blog post for guest testing while the hosted backend is not configured.',
                status: 'Active',
                images: [],
                date: now
            }
        ],
        car_comments: []
    };
}

const getLocalDb = () => {
    const stored = localStorage.getItem(LOCAL_DB_STORAGE_KEY);
    if (!stored) {
        const initialDb = createLocalDb();
        localStorage.setItem(LOCAL_DB_STORAGE_KEY, JSON.stringify(initialDb));
        return initialDb;
    }

    return JSON.parse(stored);
}

const saveLocalDb = db => localStorage.setItem(LOCAL_DB_STORAGE_KEY, JSON.stringify(db));

const getLocalTable = (db, table) => {
    if (!db[table]) db[table] = [];
    return db[table];
}

const compareValues = (actual, operator, expected) => {
    if (operator === '==') return actual === expected;
    if (operator === '>=') return Number(actual) >= Number(expected);
    if (operator === '<=') return Number(actual) <= Number(expected);
    return true;
}

const getLocalDocument = target => {
    const db = getLocalDb();
    if (target.type === 'bid') {
        const bid = getLocalTable(db, 'product_bids').find(row => (
            row.product_id === target.productId && row.username === target.username
        ));
        return createSnapshot(target.username, fromDb(bid));
    }

    const row = getLocalTable(db, target.table).find(item => String(item[target.idColumn]) === String(target.id));
    return createSnapshot(target.id, fromDb(row));
}

const addLocalDocument = ({ target, payload }) => {
    const db = getLocalDb();
    const table = getLocalTable(db, target.table);
    const id = createLocalId(target.table);
    const row = { id, ...payload };

    if (target.type === 'comments') {
        row[target.parentColumn] = target.parentId;
    }

    table.push(row);
    saveLocalDb(db);
    return { id, data: () => fromDb(row) };
}

const setLocalDocument = ({ target, payload, merge }) => {
    const db = getLocalDb();
    const table = getLocalTable(db, target.table);
    const idColumn = target.idColumn;
    const existingIndex = table.findIndex(row => String(row[idColumn]) === String(target.id));
    const row = {
        ...(merge && existingIndex >= 0 ? table[existingIndex] : {}),
        ...payload,
        [idColumn]: target.id
    };

    if (existingIndex >= 0) table[existingIndex] = row;
    else table.push(row);

    saveLocalDb(db);
    return { id: row[idColumn], data: () => fromDb(row) };
}

const queryLocalCollection = ({ target, filters, sortBy, maxLimit, offset }) => {
    const db = getLocalDb();
    const rows = getLocalTable(db, target.table)
        .filter(row => !('status' in row) || row.status === 'Active')
        .filter(row => filters.every(({ prop, operator, value }) => compareValues(row[prop], operator, value)))
        .sort((a, b) => Number(b[sortBy] || 0) - Number(a[sortBy] || 0))
        .slice(offset, offset + maxLimit);

    return rows.map(fromDb);
}

export const placeLocalBid = async ({ username, price, productId }) => {
    const db = getLocalDb();
    const product = getLocalTable(db, 'products').find(row => row.id === productId);
    if (!product) throw Error("Product doesn't exist anymore.");
    if (product.status !== 'Active') throw Error('Auction is not active.');
    if (product.displayName === username || product.display_name === username) {
        throw Error('Owners cannot bid on their own auctions.');
    }

    const bids = getLocalTable(db, 'product_bids');
    const topBid = bids
        .filter(row => row.product_id === productId)
        .sort((a, b) => Number(b.price) - Number(a.price))[0];
    const minimumPrice = Math.max(Number(product.price) || 0, Number(topBid?.price) || 0) + 1;
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < minimumPrice) {
        throw Error(`Price must be at least ${minimumPrice}.`);
    }

    const user = auth.currentUser;
    const existingIndex = bids.findIndex(row => row.product_id === productId && row.username === username);
    const bid = {
        product_id: productId,
        username,
        uid: user?.uid || username,
        price: numericPrice,
        date: getLocalNow()
    };

    if (existingIndex >= 0) bids[existingIndex] = bid;
    else bids.push(bid);

    product.currentBid = { username, uid: bid.uid, price: numericPrice };
    product.current_bid = product.currentBid;
    saveLocalDb(db);
    return { data: { message: 'You have successfully bid.', minimumPrice, price: numericPrice } };
}

export const expireLocalProduct = async ({ productId }) => {
    const db = getLocalDb();
    const product = getLocalTable(db, 'products').find(row => row.id === productId);
    if (product) {
        product.status = 'Active';
        product.expires_at = product.expires_at || (Number(product.date) + Number(product.duration) * MS_PER_DAY);
        saveLocalDb(db);
    }
    return { data: { message: 'Auction expiry has been scheduled.' } };
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
    if (target.type !== 'document' && target.type !== 'bid') throw Error(`Expected document path: ${path}`);

    if (!isSupabaseConfigured) {
        return getLocalDocument(target);
    }

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

    if (!isSupabaseConfigured) {
        return addLocalDocument({ target, payload });
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

    if (!isSupabaseConfigured) {
        return setLocalDocument({ target, payload, merge });
    }

    const query = supabase.from(target.table);
    const request = merge ? query.upsert(payload, { onConflict: target.idColumn }) : query.insert(payload);
    const { data: saved, error } = await request.select('*').single();

    if (error) throw error;
    return { id: saved[target.idColumn], data: () => fromDb(saved) };
}

export const queryCollection = async ({ path, filters = [], sortBy = 'date', maxLimit = 10, offset = 0 }) => {
    const target = parsePath(path);
    if (target.type !== 'collection') throw Error(`Expected collection path: ${path}`);

    if (!isSupabaseConfigured) {
        return queryLocalCollection({ target, filters, sortBy, maxLimit, offset });
    }

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

    if (!isSupabaseConfigured) {
        try {
            const db = getLocalDb();
            const rows = getLocalTable(db, target.table)
                .filter(row => target.type !== 'comments' || row[target.parentColumn] === target.parentId)
                .sort((a, b) => Number(b.date || 0) - Number(a.date || 0));
            cb(createCollectionSnapshot(rows));
        } catch (err) {
            errcb(err);
        }
        return () => {};
    }

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
