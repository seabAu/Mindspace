import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App.jsx';
import ThemeProvider from '@/lib/providers/ThemeProvider.jsx';
// import DataProvider from '@/lib/providers/DataProvider.jsx';
import { Toaster } from '@/components/ui/sonner.jsx';
import { Check, InfoIcon, Loader, MailWarning, TriangleAlert } from 'lucide-react';
import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider } from '@/lib/providers/SettingsContext.jsx';
import { THEME_STORAGE_NAME } from '@/lib/config/constants.js';
import NavProvider from '@/lib/providers/NavProvider.jsx';
import { FormDialogWrapper } from '@/blocks/FormDialog/FormDialogWrapper.jsx';
import { FormDialogProvider } from '@/lib/providers/FormDialogContext.jsx';
import { SocketContextProvider } from '@/lib/providers/SocketContext.jsx';
import FormGeneratorProvider from '@/lib/providers/FormGeneratorContext.jsx';
import { ContextMenuProvider } from '@/lib/providers/ContextMenuProvider.jsx';

createRoot( document.getElementById( 'root' ) ).render(
    <StrictMode>
        <BrowserRouter>
            <SettingsProvider>
                <NavProvider>
                    <ContextMenuProvider>
                        <ThemeProvider
                            // enableSystem
                            // disableTransitionOnChange
                            attribute={ 'class' }
                            storageKey={ THEME_STORAGE_NAME }
                            defaultTheme={ localStorage.getItem( THEME_STORAGE_NAME ) || 'system' }
                        >
                            <FormGeneratorProvider>
                                <FormDialogProvider>
                                    <SocketContextProvider>
                                        <App />
                                    </SocketContextProvider>

                                    {/*  <Toaster
                                            // richColors={ false }
                                            richColors={ true }
                                            expand={ true }
                                            position={ `bottom-right` } // "top-right"
                                            visibleToasts={ 10 }
                                            duration={ 5000 }
                                            icons={ {
                                                success: <Check />,
                                                info: <InfoIcon />,
                                                warning: <MailWarning />,
                                                error: <TriangleAlert />,
                                                loading: <Loader />,
                                            } }
                                            toastOptions={ {
                                                style: {
                                                    background: `linear-gradient(90deg, #6997d3 8px, rgba(0, 0, 0, 0) 1%) 95px 100px, -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(8px, #6997d3), color-stop(1%, rgba(0, 0, 0, 0))), snow;`,
                                                },
                                                // unstyled: true,
                                                ClassNames: {
                                                    // toast: 'bg-blue-400',
                                                    // title: 'text-red-400',
                                                    // description: 'text-red-400',
                                                    // actionButton: 'bg-zinc-400',
                                                    // cancelButton: 'bg-orange-400',
                                                    // closeButton: 'bg-lime-400',
                                                }
                                            } }
                                            // offset={ { bottom: '24px', right: "16px", left: "16px" } }
                                            // mobileOffset={ { bottom: '16px' } }
                                            dir={ `ltr` }
                                            hotkey={ [ 'esc' ] }
                                        />
                                    */}

                                    <FormDialogWrapper />
                                </FormDialogProvider>
                            </FormGeneratorProvider>
                        </ThemeProvider>
                    </ContextMenuProvider>
                </NavProvider>
            </SettingsProvider>
        </BrowserRouter>
    </StrictMode>,
);
