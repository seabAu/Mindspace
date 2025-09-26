import React from 'react';


const Content = ( props ) => {
    const {
        children,
        style,
        centered = true,
        header,
        content,
        body,
        footer,
    } = props;

    // const {
    //     // Debug state
    //     debug,
    //     setDebug,

    //     // Data state
    //     user,
    //     setUser,
    //     notesData,
    //     setNotesData,

    //     // UI state
    //     theme,
    //     setTheme,
    //     openSidebar,
    //     setOpenSidebar,
    // } = useStore();

    return (
        <div className={ `page-content` }>
            {
                ( header || content || body || footer ) && (
                    <Content.Container>

                        <Content.Header
                            className={ `` }
                        >

                        </Content.Header>

                        <Content.Header
                            className={ `flex flex-row justify-center items-center h-full w-full` }
                            style={ style || {} }
                        >

                        </Content.Header>

                        <Content.Body
                        // className={ `flex flex-col gap-2 justify-center items-center h-full w-full max-w-full px-1` }
                        >
                            { children ? children : <></> }
                        </Content.Body>

                        <Content.Footer>

                        </Content.Footer>

                    </Content.Container>
                )
            }
        </div>
    );
};


const Container = ( props ) => {
    const {
        children,
        className,
        centered = true,
        options,
    } = props;

    return (
        <div className={ `flex flex-col gap-1 justify-start items-start h-full w-full max-w-full px-1 mx-auto ${ className }` }>
            { children ? children : <></> }
        </div>
    );
};

Content.Container = Container;

const Header = ( props ) => {
    const {
        children,
        className,
        centered = true,
        options,
    } = props;

    return (
        <div className={ `content-header rounded-xl flex flex-row ${ centered ? 'justify-center items-center' : '' } h-full w-full ${ className }` }>
            { children ? children : <></> }
        </div>
    );
};

Content.Header = Header;

const Body = ( props ) => {
    const {
        children,
        className,
        centered = true,
        options,
    } = props;

    return ( <>
        <div
            // className={ `content-body mx-auto h-full max-h-screen w-full max-w-full flex ${ centered ? 'justify-center items-center' : 'justify-stretch items-center' }  rounded-xl ${ className }` }
            className={ `content-body mx-auto h-max w-full max-w-full flex ${ centered ? 'justify-center items-center' : '' } rounded-xl ${ className }` }
        >
            <div className={ `w-full h-full overflow-hidden ` }>
                { children ? children : <></> }
            </div>
        </div>
    </> );
};

Content.Body = Body;


const Footer = ( props ) => {
    const {
        children,
        className,
        centered = true,
        options,
    } = props;

    return (
        <div className={ `content-footer flex flex-col flex-nowrap ${ centered ? 'justify-center items-center' : '' } gap-2 mx-auto h-auto w-full max-w-full rounded-xl ${ className }` }>
            { children ? children : <></> }
        </div>
    );
};

Content.Footer = Footer;



export default Content;
