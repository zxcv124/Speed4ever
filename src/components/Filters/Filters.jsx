import TextField from '../../ui/TextField/TextField';
import styles from './Filters.module.scss';
import logo from '../../assets/logo.png';
import Select from '../../ui/Select/Select';
import { useLocation } from 'react-router-dom';
import useModel from '../../hooks/useModel';
import { useState } from 'react';
import Form from '../../hoc/Form';
import useFilter from '../../hooks/useFilter';
import toNormalDate from '../../utils/toNormalDate';
import getNextDate from '../../firebase/getNextDate';
import HashLink from '../HashLink/HashLink';

const FiltersWrapper = () => {
    useModel();

    const [currentFilters, onFilterChange] = useFilter();

    const [filters, setFilters] = useState({ ...currentFilters });

    const onChange = e => setFilters({ ...filters, [e.target.name]: e.target.value });
    const onDateChange = e => {
        const { name, value } = e.target
        setFilters({ ...filters, [name]: value === '' ? value : new Date(value).getTime() });
    }

    const onSubmit = () => onFilterChange(filters);

    const { min_date, max_date, min_price, max_price } = filters;


    return (
        <>
            <HashLink replace className={`${styles.blur} p-fixed bg-dark start-0 top-0 w-100 h-100 z-index-4 opacity-2`}></HashLink>
            <Form onSubmit={onSubmit} className={`p-fixed submitted left-menu-animation d-flex flex-column gap-lg-5 gap-4 bg-light elevation-1 z-index-4 bottom-0 top-0 p-lg-5 p-4 overflow-auto ${styles.root}`}>
                <img alt='' src={logo} className={styles.logo} />
                {!min_price && !max_price && (
                    <div>
                        <h4 className='m-0'>Date</h4>
                        <TextField
                            onKeyDown={(e) => e.preventDefault()}
                            label='Start Date'
                            onChange={onDateChange}
                            value={toNormalDate(min_date)}
                            className='mt-2 mb-3'
                            type='date'
                            name='min_date'
                            max={toNormalDate(getNextDate(-1))}
                            errorText='Should be less than End Date'
                        />
                        <TextField label='End Date'
                            onKeyDown={(e) => e.preventDefault()}
                            onChange={onDateChange}
                            value={toNormalDate(max_date)}
                            type='date'
                            name='max_date'
                            min={toNormalDate(getNextDate(1, min_date))}
                            errorText='Should be greater than Start Price'
                        />
                    </div>
                )}
                {!min_date && !max_date && (
                    <div>
                        <h4 className='m-0'>Price</h4>
                        <div className='d-grid col-2 gap-3 mt-2 ai-start'>
                            <TextField
                                value={min_price || ''}
                                placeholder='Min'
                                type='number'
                                onChange={onChange}
                                errorText='Should be less than Max Price'
                                name='min_price'
                                min={1}
                                max={max_price - 1 || ''}
                            />
                            <TextField
                                value={max_price || ''}
                                placeholder='Max'
                                type='number'
                                onChange={onChange}
                                errorText='Should be greater than Min Price'
                                name='max_price'
                                min={+min_price + 1 || 1}
                            />
                        </div>
                    </div>
                )}
                <div>
                    <h4 className='mt-0 mb-2'>Shipping Cost</h4>
                    <Select
                        name='shipping_cost'
                        onChange={onChange}
                        value={filters.shipping_cost || ''}
                    >
                        <option value="">Choose</option>
                        <option value="Free">Free</option>
                        <option value="On Seller">On Seller</option>
                        <option value="On Buyer">On Buyer</option>
                    </Select>
                </div>
                <div>
                    <h4 className='mt-0 mb-2'>Shipping Method</h4>
                    <Select
                        name='shipping_method'
                        onChange={onChange}
                        value={filters.shipping_method || ''}
                    >
                        <option value="">Choose Method</option>
                        <option value="Free">By Air</option>
                        <option value="On Seller">By Sea</option>
                        <option value="On Buyer">By Land</option>
                    </Select>
                </div>
                <button className='btn-primary mt-auto'>Apply</button>
            </Form>
        </>
    )
}

const Filters = () => useLocation().hash === '#filters' && <FiltersWrapper />;


export default Filters;
