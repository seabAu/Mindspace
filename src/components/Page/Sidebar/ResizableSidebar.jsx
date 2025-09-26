const { SIDEBAR_LEFT_KEYBOARD_SHORTCUT, SIDEBAR_RIGHT_KEYBOARD_SHORTCUT, SIDEBAR_WIDTH_LEFT, SIDEBAR_WIDTH_ICON } = require( "@/lib/config/constants" );

const Side = ( props ) => {
    const {
        active = true,
        mini = false,
        openSidebar,
        setOpenSidebar = () => { },
        sidebarContent,
        setSidebarContent = () => { },
        collapseToIcons = false,
        header,
        nav,
        footer,
        children,
        className,
        headerClasses,
        navClasses,
        contentNavClasses,
        contentClasses,
        footerClasses,
        side = "left",
        width = SIDEBAR_WIDTH_LEFT,
        keyboardShortcut,
    } = props;

    const [ sidebarWidth, setSidebarWidth ] = useState( width );

    const toggleSidebar = ( e ) => {
        e.preventDefault();
        setOpenSidebar( !openSidebar );
    };

    return (
        <SidebarProvider
            open={ openSidebar }
            onOpenChange={ setOpenSidebar }
            state={ openSidebar ? "expanded" : "collapsed" }
            keyboardShortcut={
                keyboardShortcut
                    ? keyboardShortcut
                    : side === "right"
                        ? SIDEBAR_RIGHT_KEYBOARD_SHORTCUT
                        : SIDEBAR_LEFT_KEYBOARD_SHORTCUT
            }
            className={ twMerge( `sidebar-${ side }-container w-auto`, mini && "mini", className ) }
            width={ `${ sidebarWidth }px` }
            style={ {
                "--sidebar-width": `${ sidebarWidth }px`,
                "--sidebar-width-icon": `${ SIDEBAR_WIDTH_ICON }px`,
            } }
        >
            <ResizablePanelGroup direction={ side === "left" ? "horizontal" : "horizontal-reverse" }>
                <ResizablePanel
                    defaultSize={ sidebarWidth }
                    minSize={ SIDEBAR_WIDTH_ICON }
                    maxSize={ 400 }
                    onResize={ ( size ) => setSidebarWidth( size ) }
                >
                    <Sidebar { ...( collapseToIcons === true ? { collapsible: "icons" } : {} ) } variant="sidebar" side={ side }>
                        { header && (
                            <Side.Header className={ headerClasses } navClasses={ navClasses }>
                                { header }
                            </Side.Header>
                        ) }
                        { ( sidebarContent || children ) && (
                            <Side.Content
                                className={ contentClasses }
                                contentNavClasses={ contentNavClasses }
                                toggleSidebar={ toggleSidebar }
                                openSidebar={ openSidebar }
                                setOpenSidebar={ setOpenSidebar }
                                nav={ nav }
                                side={ side }
                                { ...props }
                            >
                                { children && children }
                                { sidebarContent && sidebarContent }
                            </Side.Content>
                        ) }
                        { footer && <Side.Footer className={ footerClasses }>{ footer }</Side.Footer> }
                    </Sidebar>
                </ResizablePanel>
                <ResizableHandle withHandle />
            </ResizablePanelGroup>
        </SidebarProvider>
    );
}

