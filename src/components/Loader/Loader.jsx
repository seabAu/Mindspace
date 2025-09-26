import React from "react";
import "./Loader.css";
import { Spinner, SpinnerReact } from "./Spinner";

const Loader = () => {
    return (
        <div className={ `loader-container opacity-60` }>
            <SpinnerReact
                size={ 'xl' }
                padding={ `0` }
                margin={ `0` }
                radius={ `20` }
                cx={ `25` }
                cy={ `25` }
                height={ `125` }
                width={ `125` }
                fill={ `#11111100` }
                stroke={ `#555555` }
                strokeWidth={ 4 }
                spinnerPadding={ 0 }
            />

            <div className="loader-text-container">
            </div>
        </div>
    );
};

export default Loader;


const LoaderDots = () => {
    return (
        <div>

            <div id="skype-loaders">
                <div class="skype-loader">
                    <div class="dot">
                        <div class="first"></div>
                    </div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>

            <div class="dots-1"></div>
            <div class="dots-2"></div>
            <div class="dots-3"></div>
            <div class="dots-4"></div>
            <div class="dots-5"></div>
            <div class="dots-6"></div>
            <div class="dots-7"></div>
            <div class="dots-8"></div>
            <div class="dots-9"></div>
            <div class="dots-10"></div>
            <div class="dots-11"></div>
            <div class="dots-12"></div>
            <div class="dots-13"></div>
            <div class="dots-14"></div>
            <div class="dots-15"></div>
            <div class="dots-16"></div>
            <div class="dots-17"></div>
            <div class="dots-18"></div>
            <div class="dots-19"></div>
            <div class="dots-20"></div>


            <div class="circle-grow">
                <div></div>
                <div></div>
            </div>

            <div class="square-list">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div class="bar-list">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
            </div>

            <div class="multi-circle">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
            </div>
        </div>
    );
};