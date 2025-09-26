/*
    This needs to push against the content component on normal size screens, and overlay them on small screens (side panel or canvas)
*/

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import useGlobalStore from '@/store/global.store';

// Sample nested content data
const nestedContent = [
    {
        title: 'Category 1',
        items: [
            { title: 'Item 1.1' },
            {
                title: 'Item 1.2',
                items: [ { title: 'Item 1.2.1' }, { title: 'Item 1.2.2' } ],
            },
        ],
    },
    {
        title: 'Category 2',
        items: [ { title: 'Item 2.1' }, { title: 'Item 2.2' } ],
    },
];

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetWrapper } from '../../Sheet/Sheet';
import { DropTree } from '../../DropTree/DropTree';

const Sidebar = ( props ) => {
    const [ leftSidebarOpen, setLeftSidebarOpen ] = useState( false );
    const [ rightSidebarOpen, setRightSidebarOpen ] = useState( false );
    const [ sidebarType, setSidebarType ] = useState( 'sidebar' );
    const {
        children,
        title = '',
        description = '',
        active = true,
        mini = false
    } = props;

    const toggleLeftSidebar = () => setLeftSidebarOpen( !leftSidebarOpen );
    const toggleRightSidebar = () => setRightSidebarOpen( !rightSidebarOpen );

    return (
        <div className='flex min-h-screen'>

            <Sidebar.Content
                side='left'
                isOpen={ leftSidebarOpen }
                onClose={ () => setLeftSidebarOpen( false ) }
                type={ sidebarType }
                title={ title }
                description={ description }
            />

            <main
                className={ cn(
                    'flex-grow p-4 transition-all duration-300 ease-in-out',
                    sidebarType === 'sidebar' && leftSidebarOpen && 'ml-64',
                    sidebarType === 'sidebar' && rightSidebarOpen && 'mr-64',
                ) }>
                <div className='space-y-4'>
                    <div className='flex items-center space-x-2'>
                        <Switch
                            id='left-sidebar'
                            checked={ leftSidebarOpen }
                            onCheckedChange={ toggleLeftSidebar }
                        />
                        <Label htmlFor='left-sidebar'>
                            Toggle Left Sidebar
                        </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <Switch
                            id='right-sidebar'
                            checked={ rightSidebarOpen }
                            onCheckedChange={ toggleRightSidebar }
                        />
                        <Label htmlFor='right-sidebar'>
                            Toggle Right Sidebar
                        </Label>
                    </div>
                    <div className='space-x-2'>
                        <button
                            onClick={ () => setSidebarType( 'sidebar' ) }
                            className='px-2 py-1 bg-gray-200 rounded'>
                            Sidebar
                        </button>
                        <button
                            onClick={ () => setSidebarType( 'drawer' ) }
                            className='px-2 py-1 bg-gray-200 rounded'>
                            Drawer
                        </button>
                        <button
                            onClick={ () => setSidebarType( 'modal' ) }
                            className='px-2 py-1 bg-gray-200 rounded'>
                            Modal
                        </button>
                    </div>
                    <p>Main content area</p>
                </div>
            </main>

            <Sidebar.Content
                side='right'
                isOpen={ rightSidebarOpen }
                onClose={ () => setRightSidebarOpen( false ) }
                type={ sidebarType }
                title={ title }
                description={ description }
            />

        </div>
    );
};

const Header = ( props ) => {
    const { children } = props;
    return <div className={ `sidebar-header` }>{ children }</div>;
};

Sidebar.Header = Header;

const Content = ( props ) => {
    const {
        title = '',
        description = '',
        side,
        isOpen,
        onClose,
        type,
        children
    } = props;
    const content = (
        <ScrollArea className='h-full'>
            <div className='p-4 space-y-4'>
                <h2 className='text-lg font-semibold'>
                    { side.charAt( 0 ).toUpperCase() + side.slice( 1 ) } Sidebar
                </h2>
                <DropTree items={ nestedContent } />
            </div>
        </ScrollArea>
    );

    if ( type === 'sidebar' ) {
        return (
            <div
                className={ cn(
                    'fixed top-0 bottom-0 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out',
                    side === 'left' ? 'left-0' : 'right-0',
                    isOpen
                        ? 'translate-x-0'
                        : side === 'left'
                            ? '-translate-x-full'
                            : 'translate-x-full',
                ) }>
                { content }
            </div>
        );
    }

    if ( type === 'drawer' ) {
        return (
            <SheetWrapper
                side={ side }
                title={ title }
                description={ description }
                trigger={ null }
                height={ null }
                width={ null }
                header={ `` }
                contents={ `` }
                footer={ `` }
                // layout={ `` }
                className={ `` }
                isOpen={ isOpen }
                onClose={ onClose }
            >
                <Sheet
                    open={ isOpen }
                    onOpenChange={ onClose }>
                    <SheetContent
                        side={ side }
                        className='w-[400px] sm:w-[540px]'>
                        { content }
                    </SheetContent>
                </Sheet>
            </SheetWrapper>
        );
    }

    if ( type === 'modal' ) {
        return (
            <Dialog
                open={ isOpen }
                onOpenChange={ onClose }>
                <DialogContent className='sm:max-w-[425px]'>
                    { content }
                </DialogContent>
            </Dialog>
        );
    }

    return null;
};

Sidebar.Content = Content;

const Footer = ( props ) => {
    const { children } = props;
    return <div className={ `sidebar-footer` }>{ children }</div>;
};

Sidebar.Footer = Footer;

export default Sidebar;