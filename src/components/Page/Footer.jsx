import React from 'react';

const Footer = ( props ) => {
    const {
        children
    } = props;
    return (
        <div className={ `page-footer` }>
            { children }
        </div>
    );
};

export default Footer;
