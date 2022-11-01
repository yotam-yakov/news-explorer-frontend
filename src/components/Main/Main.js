import React from 'react';
import Preloader from '../Preloader/Preloader';

export default function Main(props) {
    const isLoading = false;

    return (
        <div className='main'>
            {isLoading ?
                <div className='main__loading'>
                    <Preloader />
                    <p className='main__loading-text'>Searching for news...</p>
                </div>
            :
                props.isSaved ?
                    <props.elementList cardTemplate={props.element} isSaved={true} />
                :
                    <div className='main__content'>
                        <h3 className='main__title'>Search results</h3>
                        <props.elementList cardTemplate={props.element} isSaved={false} />
                        <button className='main__button'>Show more</button>
                    </div>
            }
            
            

        </div>
    )
}