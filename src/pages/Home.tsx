import React, {useCallback, useEffect, useRef} from 'react';
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";

import {Categories, Sort, PizzaBlock, Skeleton, Pagination} from '../components'

import {PizzaItems} from "../redux/pizzas/types";

import {useAppDispatch} from "../redux/store";
import {selectPizza} from "../redux/pizzas/selectors";
import {setCategoryId, setPage} from "../redux/filter/slice";
import {selectFilter} from "../redux/filter/selectors";
import {fetchPizzas} from "../redux/pizzas/asyncActions";


const Home: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const isMounted = useRef(false);

    const {items, status} = useSelector(selectPizza);
    const {categoryId, sort, page, searchValue} = useSelector(selectFilter);

    const onChangeCategory = useCallback((idx: number) => {
        dispatch(setCategoryId(idx));
    }, [])
    const onChangePage = (page: number) => {
        dispatch(setPage(page));
    };
    const getPizzas = async () => {
        const sortBy = sort.sortProperty.replace('-', '');
        const order = sort.sortProperty.includes('-') ? 'asc' : 'desc';
        const category = categoryId > 0 ? `category=${categoryId}` : '';
        const search = searchValue ? `&search=${searchValue}` : '';

        dispatch(
            fetchPizzas({
                sortBy,
                order,
                category,
                search,
                page: String(page)
            }),
        );
        window.scrollTo(0, 0);
    }
    // Если изменили параметры и был первый рендер
    // useEffect(() => {
    //     if (isMounted.current) {
    //         const params = {
    //             categoryId: categoryId > 0 ? categoryId : null,
    //             sortProperty: sort.sortProperty,
    //             page,
    //         };
    //         const queryString = qs.stringify(params, {skipNulls: true});
    //         navigate(`/?${queryString}`)
    //     }
    //
    //     if (!window.location.search) {
    //         dispatch(fetchPizzas({} as FetchPizzaParams))
    //     }
    // }, [categoryId, sort.sortProperty, searchValue, page])

    useEffect(() => {
        getPizzas()
    }, [categoryId, sort.sortProperty, searchValue, page]);

    // // Если был первй рендер, то провеяем URL-параметры и сохраняем в редаксе
    // useEffect(() => {
    //     if (window.location.search) {
    //         const params = qs.parse(window.location.search.substring(1)) as unknown as FetchPizzaParams;
    //         const sort = sortList.find((obj) => obj.sortProperty === params.sortBy);
    //         dispatch(setFilters({
    //             searchValue: params.search,
    //             categoryId: Number(params.category),
    //             page: Number(params.page),
    //             sort: sort || sortList[0],
    //         }))
    //     }
    // }, [])


    // Если был первый рендер, то запрашиваем пиццу

    const pizzas = items && items.map((obj: PizzaItems) =>
        <PizzaBlock key={obj.id} {...obj}/>
    )
    const skeletons = [...new Array(4)].map((_, index) => <Skeleton key={index}/>)

    return (
        <div className="container">
            <div className="content__top">
                <Categories categoryName={categoryId} onChangeCategory={onChangeCategory}/>
                <Sort sort={sort}/>
            </div>
            <h2 className="content__title">Все пиццы</h2>
            {status === 'error'
                ?
                <div className='content__error-info'>
                    <h2>Произошла ошибка 😕</h2>
                    <p>К сожалению, не удалось получить пиццы. Попробуйте повторить позже.</p>
                </div>
                :
                <div className="content__items">
                    {status === 'loading'
                        ? skeletons
                        : pizzas
                    }
                </div>
            }

            <Pagination value={page} changePageHandler={onChangePage}/>
        </div>
    );
};

export default Home;