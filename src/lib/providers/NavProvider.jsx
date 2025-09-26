// Context provider for providing sitewide navigation and sitewide awareness of other existing pages.

import React, {
    useCallback,
    useContext,
    createContext,
    useEffect,
    useState,
    useMemo,
} from 'react';
import * as utils from 'akashatools';
import { caseCamelToSentence } from '../utilities/string';
import useLocalStorage from '../hooks/useLocalStorage';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
// Constants / Config
import {
    CONTENT_BREADCRUMBS_HEIGHT,
    CONTENT_HEADER_HEIGHT,
    DATE_PICKER_OPTIONS,
    ROUTE_NOTES_ACTIVE_FILE_NAME,
    ROUTES_DASHBOARD,
    ROUTES_HOME,
    ROUTES_INSIGHTS,
    ROUTES_MESSAGES,
    ROUTES_NOTES,
    ROUTES_NOTIFICATIONS,
    ROUTES_PLANNER,
    ROUTES_PLANNER_CALENDARS,
    ROUTES_PLANNER_EVENTS,
    ROUTES_PLANNER_LOGS,
    ROUTES_PLANNER_PLANNERS,
    ROUTES_REFLECT,
    ROUTES_REMINDERS,
    ROUTES_SETTINGS,
    ROUTES_STATS,
    ROUTES_TIME,
    ROUTES_TRASH,
    SIDEBAR_LEFT_KEYBOARD_SHORTCUT,
    SIDEBAR_RIGHT_KEYBOARD_SHORTCUT,
    SIDEBAR_WIDTH_ICON,
    SIDEBAR_WIDTH_LEFT,
    SIDEBAR_WIDTH_RIGHT,
    SIDEBAR_WIDTH_RIGHT_MINI,
} from '@/lib/config/constants';

import { useLocation, useNavigate } from 'react-router-dom';

import {
    Folder,
    ArrowUpRight,
    AudioWaveform,
    BadgeCheck,
    Bell,
    Blocks,
    BoxesIcon,
    CalendarCheck,
    CalendarIcon,
    Check,
    ChevronDown,
    ChevronRight,
    ChevronsUpDown,
    Cog,
    Command,
    CreditCard,
    File,
    FileIcon,
    FolderIcon,
    Inbox,
    Link,
    LogOut,
    MessageCircleQuestion,
    MoreHorizontal,
    PersonStanding,
    Plus,
    RefreshCwIcon,
    Search,
    Settings2,
    Sparkles,
    StarOff,
    Trash2,
    CalendarPlus,
    CalendarMinus,
    CalendarArrowUp,
    CalendarFoldIcon,
    PlusSquare,
    MinusSquare,
    LucideArrowLeftRight,
    BellIcon,
    BellRing,
    Clock,
    HeartPulseIcon,
    GlassesIcon,
    BookDashed,
    BookHeartIcon,
    Maximize,
    Minimize,
    RefreshCwOffIcon,
    Box,
    House,
    PanelsTopLeft,
    LucideLayoutGrid,
    RefreshCcw,
    PlusCircleIcon,
    HelpCircle,
    Settings,
    Shield,
    Mail,
    User,
    FileText,
    Lock,
    LucideLaptopMinimalCheck,
    LucideMessageCircleMore,
    AlertCircleIcon,
    LogsIcon,
    CalendarCheckIcon,
    ChartBarStacked,
    CalendarDays,
    NotepadTextDashed,
    LucideCalendarHeart,
    ListChecks,
    HomeIcon,
    LayoutDashboard,
    AlertCircle,
    InboxIcon,
    ListIcon,
    Clock10Icon,
    SparkleIcon,
    LucideHome,
    CogIcon,
    PinIcon,
    PinOffIcon,
    WorkflowIcon,
    BrainCog,
    Brain,
    LogInIcon,
    UserPlusIcon,
    MessageCircleCode,
    DollarSignIcon,
    MailQuestionIcon,
    BookHeart,
    UserCog2Icon,
    UserCircle2Icon,
} from 'lucide-react';
import useGlobalStore from '@/store/global.store';
import usePlannerStore from '@/store/planner.store';
import useNotesStore from '@/store/note.store';
import useTasksStore from '@/store/task.store';
import useStatsStore from '@/store/stats.store';
import useReminderStore from '@/store/reminder.store';
import useNotificationsStore from '@/store/notification.store';
import Home from '@/pages/Home/Home';
import DashboardHomePage from '@/pages/Dashboard/DashHome/DashboardHome';
import AIPage, { AIPagePlatform } from '@/pages/Dashboard/Orion/AIPage';
// import { TimePage } from '@/pages/Dashboard/Pomodoro/TimePage';
import JournalPage from '@/features/Reflect/Journal/JournalPage';
import NotesPage from '@/pages/Dashboard/Notes/NotesPage';
import PlannerPage, {
    EventAgenda,
} from '@/pages/Dashboard/Planner/PlannerPage';
import TodoPage from '@/pages/Dashboard/Task/TodoPage';
import WorkspacesPage from '@/pages/Dashboard/Workspaces/WorkspacesPage';
import { SearchPage } from '@/pages/Dashboard/Search/SearchPage';
import RemindersPage from '@/pages/Dashboard/Message/RemindersPage';
import { isSameDay } from 'date-fns';
import { TodoLeftSidebarContent } from '@/features/Todo/blocks/Sidebar/TodoLeftSidebarContent';
import PlannerLeftSidebarContent from '@/features/Planner/blocks/Sidebar/PlannerLeftSidebarContent';
import NotesLeftSidebarContent from '@/features/Note/blocks/Sidebar/NotesLeftSidebarContent';
import ReflectStatsSidebar from '@/features/Reflect/Stats/views/sidebar/ReflectStatsSidebar';
import PlannerLogRightSidebarContent from '@/features/Reflect/Journal/blocks/Sidebar/PlannerLogRightSidebarContent';
import { ReminderLeftSidebar } from '@/features/Remind/blocks/Sidebar/ReminderLeftSidebar';
import DashboardLeftSidebar from '@/features/Dashboard/blocks/Sidebar/DashboardLeftSidebar';
import TrashPage from '@/pages/Dashboard/Trash/TrashPage';
import SettingsPage from '@/pages/Dashboard/Settings/SettingsPage';
import HelpDropdown from '@/pages/HelpDropdown';
import useAuth from '../hooks/useAuth';
import UserSettingsPage from '@/pages/User/UserSettingsPage';
// import HabitsPage from '@/pages/Dashboard/Habits/HabitsPage';
import ReflectPage from '@/pages/Dashboard/Reflect/ReflectPage';
import EventList from '@/features/Planner/blocks/Event/EventList';
import PlannerList from '@/features/Planner/blocks/Planner/PlannerList';
import LogCreate from '@/features/Reflect/Journal/views/LogCreate';
import LogList from '@/features/Reflect/Journal/views/LogList';
import LogDetail from '@/features/Reflect/Journal/views/LogDetail';
import LogSchemaView from '@/features/Reflect/Journal/views/LogSchemaView';
import { LogCalendarView } from '@/features/Reflect/Journal/views/LogCalendar/LogCalendarView';
import CalendarView from '@/features/Planner/blocks/Scheduler/FullCalendar';
import TodayView from '@/features/Planner/blocks/Today/PlannerTodayView';
import EventCreate from '@/features/Planner/blocks/Event/EventCreate';
import EventDetail from '@/features/Planner/blocks/Event/EventDetail';
import PlannerCreate from '@/features/Planner/blocks/Planner/PlannerCreate';
import PlannerDetail from '@/features/Planner/blocks/Planner/PlannerDetail';
import { isObjectId } from '../utilities/data';

import { buildBreadcrumbPath, calculateTrashCount, getDataLengthSafe } from '@/lib/utilities/nav.js';
import WorkspacesLeftSidebarContent from '@/features/Spaces/blocks/Sidebar/WorkspacesLeftSidebarContent';
import ReflectLeftSidebar from '@/features/Reflect/blocks/Sidebar/ReflectLeftSidebar';
import RecursiveNavigationTree from '@/components/Nav/NavTree';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import HabitStreaksView from '@/features/Reflect/Habit/views/HabitStreaksView';
import HabitCalendarView from '@/features/Reflect/Habit/views/HabitCalendarView';
import HabitGanttView from '@/features/Reflect/Habit/views/HabitGanttView';
import HabitChartsView from '@/features/Reflect/Habit/views/HabitChartView';
import Login from '@/pages/Login/Login';
import UserProfilePage from '@/pages/User/UserProfilePage';
import TimePage from '@/pages/Dashboard/Time/TimePage';
import useReflectStore from '@/store/reflect.store';
import EnhancedTimeGrid from '@/features/Time/blocks/TimeGrid/EnhancedTimeGrid';
import { PomodoroTimer } from '@/features/Time/blocks/FocusTimer';
import TimeHeatmap from '@/features/Time/blocks/Heatmap/TimeHeatmap';
import Timeblocks from '@/features/Time/blocks/Timeblocks/Timeblocks';
import { CountdownTimers } from '@/features/Time/blocks/timer/CountdownTimers';
import SupportPage from '@/pages/Support/SupportPage';
import PricingPage from '@/pages/About/Pricing/PricingPage';
import UserSubscriptionStatus from '@/pages/User/UserSubscriptionStatus';
import LandingPage from '@/pages/Landing/LandingPage';
import ProSignupPage from '../../pages/Signup/ProSignupPage';
import AboutPage from '../../pages/About/AboutPage';
import UserBillingPage from '../../pages/User/UserBillingPage';
import { FaFileInvoice } from 'react-icons/fa6';

const NavContext = createContext();

const NavProvider = ( { children }, ...props ) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { hash, pathname, search } = location;
    // const path = useMemo( () => ( pathname?.split( '/' ) ), [ pathname ] );
    // const endpoint = path?.length > 0 ? path?.[ path?.length - 1 ] : '';
    const path = useMemo( () => pathname?.split( '/' ).filter( x => x ), [ pathname ] );
    const endpoint = useMemo( () => path?.length > 0 ? path[ path.length - 1 ] : '', [ path ] );

    const pathnames = location.pathname.split( '/' ).filter( ( x ) => x );

    // React data-fetch hooks.
    const {
        // Variables
        // userLoggedIn,
        // setUserLoggedIn,
        user: authUserData,
        userToken: authUserToken,
        setUserToken: setAuthUserToken,
        error: authError,
        loading: authLoading,
        debug: authDebug,
        setDebug: setAuthDebug,
        handleAuthRouting,

        // Fetch functions
        login,
        signup,
        authUser,

        // Getter / Setter functions
        SetToken,
        GetToken,
        DeleteToken,
    } = useAuth();

    const settingsDialogOpen = useGlobalStore(
        ( state ) => state.settingsDialogOpen,
    );
    const setSettingsDialogOpen = useGlobalStore(
        ( state ) => state.setSettingsDialogOpen,
    );
    const schemas = useGlobalStore( ( state ) => state.schemas );
    const getSchema = useGlobalStore( ( state ) => state.getSchema );
    const getDataOfType = useGlobalStore( ( state ) => state.getDataOfType );

    // Nav specific global state
    const debug = useGlobalStore( ( state ) => state.debug );
    const dashboardActive = useGlobalStore( ( state ) => state.dashboardActive );
    const setDashboardActive = useGlobalStore(
        ( state ) => state.setDashboardActive,
    );
    const selectedDate = useGlobalStore( ( state ) => state.selectedDate );
    const setSelectedDate = useGlobalStore( ( state ) => state.setSelectedDate );

    const habitsData = useReflectStore( ( state ) => state.habitsData );
    const statsData = useReflectStore( ( state ) => state.statsData );
    const notesData = useNotesStore( ( state ) => state.notesData );
    const recentNotesData = useNotesStore( ( state ) => state.recentNotesData );
    const plannerData = usePlannerStore( ( state ) => state.plannerData );
    const eventsData = usePlannerStore( ( state ) => state.eventsData );
    const logsData = useReflectStore( ( state ) => state.logsData );
    const calendarsData = usePlannerStore( ( state ) => state.calendarsData );
    const tasksData = useTasksStore( ( state ) => state.tasksData );
    const goalsData = useTasksStore( ( state ) => state.goalsData );
    const todoLists = useTasksStore( ( state ) => state.todoLists );
    const todoListGroups = useTasksStore( ( state ) => state.customGroups );
    const workspacesData = useGlobalStore( ( state ) => state.workspacesData );
    const remindersData = useReminderStore( ( state ) => state.remindersData );
    const notificationsData = useNotificationsStore( ( state ) => state.notificationsData );


    const navCurrentPath = useGlobalStore( ( state ) => state.navCurrentPath );
    const setNavCurrentPath = useGlobalStore( ( state ) => state.setNavCurrentPath );
    const navActiveEndpoint = useGlobalStore( ( state ) => state.navActiveEndpoint );
    const setNavActiveEndpoint = useGlobalStore( ( state ) => state.setNavActiveEndpoint );
    const navActiveConfig = useGlobalStore( ( state ) => state.navActiveConfig );
    const setNavActiveConfig = useGlobalStore( ( state ) => state.setNavActiveConfig );

    const [ navTreePinned, setNavTreePinned ] = useState( false );


    const getPath = () => {
        return path;
    };

    const getRelativePath2 = ( anchor ) => {
        if ( anchor && utils.val.isString( anchor ) && anchor !== '' ) {
            if ( utils.val.isValidArray( path, true ) ) {
                if (
                    path.includes( anchor ) &&
                    path.length > path.indexOf( anchor ) + 1
                ) {
                    let index = path.indexOf( anchor );
                    return path?.filter( ( _, i ) => i >= index );
                }
            }
            // return anchor;
        }
        return path?.[ path?.length - 1 ];
    };

    const getRelativePath = ( anchor = '' ) => {
        if ( anchor && utils.val.isString( anchor ) && anchor !== '' ) {
            if ( utils.val.isValidArray( path, true ) ) {
                if ( path.includes( anchor ) ) {
                    // Anchor is in the current path.
                    let index = path.indexOf( anchor );
                    if ( path.length > index + 1 ) {
                        // Return the path starting from the anchor's position.
                        return path?.filter( ( _, i ) => i >= index );
                    } else {
                        // The anchor is at the last index in the path, so just return [].
                        return [];
                    }
                } else {
                    // Anchor is not in the current path. Return a special message letting the calling function know it made an invalid request.
                    return [ -1 ];
                }
            }
            // return anchor;
        }
        return path?.[ path?.length - 1 ];
    };

    const getPathFrom = ( anchor ) => {
        if ( anchor && utils.val.isString( anchor ) && anchor !== '' ) {
            if ( utils.val.isValidArray( path, true ) ) {
                if (
                    path.includes( anchor ) &&
                    path.length > path.indexOf( anchor ) + 1
                ) {
                    return path?.[ path.indexOf( anchor ) + 1 ];
                }
            }
            // return anchor;
        }
        return path?.[ path?.length - 1 ];
    };

    const getDataLengthSafe = ( data ) => {
        return utils.val.isValidArray( data, true ) ? data.length : ``;
    };

    const getTrash = () => {
        () => {
            // let wsTrash = getDataLengthSafe( workspacesData );
            // let evTrash = getDataLengthSafe( eventsData );
            // let taTrash = getDataLengthSafe( tasksData );


            let stTrash = utils.val.isValidArray( statsData, true )
                ? statsData.filter( ( val ) => val?.inTrash ).length
                : 0;

            let haTrash = utils.val.isValidArray( habitsData, true )
                ? habitsData.filter( ( val ) => val?.inTrash ).length
                : 0;

            let noTrash = utils.val.isValidArray( notesData, true )
                ? notesData.filter( ( val ) => val?.inTrash ).length
                : 0;

            let wsTrash = utils.val.isValidArray( workspacesData, true )
                ? workspacesData.filter( ( val ) => val?.inTrash ).length
                : 0;

            let evTrash = utils.val.isValidArray( eventsData, true )
                ? eventsData.filter( ( val ) => val?.inTrash ).length
                : 0;

            let taTrash = utils.val.isValidArray( tasksData, true )
                ? tasksData.filter( ( val ) => val?.inTrash ).length
                : 0;

            let logTrash = utils.val.isValidArray( logsData, true )
                ? logsData.filter( ( val ) => val?.inTrash ).length
                : 0;

            let calTrash = utils.val.isValidArray( calendarsData, true )
                ? calendarsData.filter( ( val ) => val?.inTrash ).length
                : 0;

            let planTrash = utils.val.isValidArray( plannerData, true )
                ? plannerData.filter( ( val ) => val?.inTrash ).length
                : 0;

            let total =
                stTrash +
                haTrash +
                foTrash +
                fiTrash +
                wsTrash +
                evTrash +
                taTrash +
                logTrash +
                calTrash +
                noTrash +
                planTrash;
            console.log( 'Trash count: ', total );
            return total ? total : 0;
        };
    };
    /* 
        const handleFetchSchemas = async () => {
            setLoading( true );
            try {
                const response = await API.get( `/api/schema/app/compass` );
                console.log( 'App.js :: handleFetchSchemas :: response?.data?.data = ', response?.data?.data, ' :: ', 'response?.data?.data?.app?.planner?.log = ', response?.data?.data?.app?.planner?.log );
                setSchemas( response?.data?.data );
    
                return response?.data?.data;
            } catch ( err ) {
                setError( err?.response?.data?.message || 'Failed to fetch schemas.' );
            } finally {
                setError( null );
                setLoading( false );
            }
        };
     */

    const getDynamicNextPaths = ( parentPath = '/', dataType = 'event' ) => {
        // let idRoutes = getIdsOfType( dataType );
        // if ( idRoutes && Array.isArray( idRoutes ) && idRoutes.length > 0 ) {
        //     idRoutes = idRoutes.map( ( route ) => ( {
        //         ...route,
        //         enabled: true,
        //         visible: true,
        //         title: `${ route?.endpoint || route?.title }`,
        //         context: `${ route?.endpoint || route?.title }`,
        //         endpoint: `${ route?.endpoint || route?.title }`,
        //         target: `${ route?.endpoint || route?.title }/*`,
        //         url: `/dash/planner/events/${ route?.endpoint || route?.title }`,
        //         element: <EventDetail editingMode={ false } parentPath={ `/dash/planner/events` } />,
        //         pages: null,
        //         getPages: () => ( [
        //             {
        //                 title: 'detail',
        //                 context: 'planner',
        //                 endpoint: 'detail',
        //                 target: 'detail/*',
        //                 url: `/dash/planner/events/${ route?.endpoint || route?.title }/detail`,
        //                 enabled: true,
        //                 visible: true,
        //                 element: <EventDetail editingMode={ false } parentPath={ `/dash/planner/events` } />,
        //                 pages: null,
        //             },
        //             {
        //                 title: 'edit',
        //                 context: 'planner',
        //                 endpoint: 'edit',
        //                 target: 'edit/*',
        //                 url: `/dash/planner/events/${ route?.endpoint || route?.title }/edit`,
        //                 enabled: true,
        //                 visible: true,
        //                 element: <EventDetail editingMode={ true } parentPath={ `/dash/planner/events` } />,
        //                 pages: null,
        //             }
        //         ] ),
        //         pageDataType: 'event',
        //     } ) );
        // }
        // return idRoutes;
    };

    const getDynamicSubRoutes = ( config ) => {
        // For a given endpoint config object, return the next-level nested routes.
        // For example, if given a generated endpoint route object for an ObjectId, provide the detail and edit routes that are present for any document management route.  
        let nextLevelOptions = [];

        if ( config && utils.val.isObject( config ) && config.hasOwnProperty( 'endpoint' ) ) {
            nextLevelOptions = [
                {
                    title: `Detail`,
                    // title: `${ tempPathTokenConfig.endpoint } - Detail`,
                    endpoint: `detail`,
                    target: `${ tempPathTokenConfig.endpoint }/*`,
                    element: tempPathTokenConfig?.element || <>{ `Element for ${ tempPathTokenConfig.endpoint }/detail` }</>,
                    pages: null,
                },
                {
                    title: `Edit`,
                    // title: `${ tempPathTokenConfig.endpoint } - Edit`,
                    endpoint: `edit`,
                    target: `${ tempPathTokenConfig.endpoint }/*`,
                    element: tempPathTokenConfig?.element || <>{ `Element for ${ tempPathTokenConfig.endpoint }/edit` }</>,
                    pages: null,
                },
            ];
        }

        return nextLevelOptions;
    };

    const getIdsOfType = ( type ) => {
        // Utilize the global store's getDataOfType function to get the data for that type, then if we get a valid response, map it down to ids and titles. 
        let ids = [];
        if ( type ) {
            let dataOfType = getDataOfType( type );
            if ( dataOfType && Array.isArray( dataOfType ) && dataOfType.length > 0 ) {
                // ids = dataOfType.map( ( item, index ) => ( {
                //     value: item?._id || item?.id,
                //     endpoint: item?._id || item?.id,
                //     label: item?.title || item?.name,
                //     index: index,
                // } ) );
                ids = dataOfType;
            }
        }

        return ids;
    };

    const convertIdsToRoutes = ( ids ) => {
        let routes = [];
        if ( ids && Array.isArray( ids ) && ids.length > 0 ) {
            routes = [ ...ids ];
            routes = routes.map( ( item, index ) => ( {
                value: item?._id || item?.id,
                endpoint: item?._id || item?.id,
                title: item?.title || item?.name,
                label: item?.title || item?.name,
                index: index,
            } ) );
        }

        return routes;
    };


    // Returns preformatted routes made from all available documents of a given data type.
    const getRoutesOfType = ( type ) => {
        if ( type ) {
            return convertIdsToRoutes(
                getIdsOfType(
                    type
                )
            );
        }

        return [];
    };

    let routesConfig = [
        {
            title: 'Home',
            context: 'user',
            endpoint: 'home',
            target: 'home/*',
            url: '/home',
            enabled: true,
            visible: true,
            element: <Home />,
            useSidebar: false,
            sidebarElement: null,
            icon: HomeIcon,
            showInMiniNav: true,
            pages: [],
            location: 'home',
        },
        {
            title: 'Landing Page',
            context: 'none',
            endpoint: 'akasha',
            target: '/akasha',
            url: '/akasha',
            enabled: true,
            visible: false,
            element: <LandingPage />,
            useSidebar: false,
            sidebarElement: null,
            icon: UserPlusIcon,
            showInMiniNav: false,
            pages: null,
            location: 'home',
        },
        {
            title: 'Login',
            context: 'user',
            endpoint: 'login',
            target: 'login/*',
            url: '/login',
            enabled: true,
            visible: false,
            element: <Login mode={ 'login' } />,
            useSidebar: false,
            sidebarElement: null,
            icon: LogInIcon,
            showInMiniNav: false,
            pages: null,
            location: 'home',
        },
        {
            title: 'Sign Up',
            context: 'user',
            endpoint: 'signup',
            target: 'signup/*',
            url: '/signup',
            enabled: true,
            visible: false,
            element: <Login mode={ 'signup' } />,
            useSidebar: false,
            sidebarElement: null,
            icon: UserPlusIcon,
            showInMiniNav: false,
            pages: null,
            location: 'home',
        },
        {
            title: 'Support',
            context: 'none',
            endpoint: 'support',
            target: 'support/*',
            url: '/support',
            enabled: true,
            visible: false,
            element: <SupportPage />,
            useSidebar: false,
            sidebarElement: null,
            icon: MessageCircleCode,
            showInMiniNav: true,
            pages: null,
            location: 'home',
        },
        {
            title: 'About',
            context: 'none',
            endpoint: 'about',
            target: 'about/*',
            url: '/about',
            enabled: true,
            visible: false,
            element: <AboutPage />,
            useSidebar: false,
            sidebarElement: null,
            icon: MailQuestionIcon,
            showInMiniNav: true,
            pages: null,
            location: 'home',
        },
        {
            title: 'FAQ',
            context: 'none',
            endpoint: 'faq',
            target: 'faq/*',
            url: '/about/faq',
            enabled: true,
            visible: false,
            element: <HelpDropdown />,
            useSidebar: false,
            sidebarElement: null,
            icon: BookHeart,
            showInMiniNav: true,
            pages: null,
            location: 'home',
        },
        {
            title: 'Pricing',
            context: 'user',
            endpoint: 'pricing',
            target: 'pricing/*',
            url: '/pricing',
            enabled: true,
            visible: false,
            element: <PricingPage />,
            useSidebar: false,
            sidebarElement: null,
            icon: DollarSignIcon,
            showInMiniNav: false,
            pages: null,
            location: 'home',
        },
        {
            title: 'Subscribe',
            context: 'user',
            endpoint: 'subscribe',
            target: 'subscribe/*',
            url: '/subscribe',
            enabled: true,
            visible: false,
            element: <ProSignupPage />,
            useSidebar: false,
            sidebarElement: null,
            icon: UserPlusIcon,
            showInMiniNav: false,
            pages: null,
            location: 'home',
        },
        {
            title: 'Pricing',
            context: 'user',
            endpoint: 'pricing',
            target: 'pricing/*',
            url: '/pricing',
            enabled: true,
            visible: false,
            element: <PricingPage />,
            useSidebar: false,
            sidebarElement: null,
            icon: UserPlusIcon,
            showInMiniNav: false,
            pages: null,
            location: 'nav-header',
        },

        {
            title: 'Dashboard',
            context: 'user',
            endpoint: 'dash',
            target: 'dash/*',
            url: '/dash',
            enabled: true,
            visible: true,
            element: <DashboardHomePage />,
            useSidebar: true,
            sidebarElement: <DashboardLeftSidebar />,
            icon: LucideHome,
            showInMiniNav: true,
            pages: [
                // Viewing another user's profile when logged in.

                {
                    title: 'User',
                    context: 'user',
                    endpoint: 'user',
                    target: 'user/*',
                    url: '/dash/user',
                    enabled: true,
                    visible: true,
                    element: <UserSettingsPage />,
                    useSidebar: false,
                    sidebarElement: null,
                    icon: BoxesIcon,
                    showInMiniNav: true,
                    pages: [ // User/profile
                        {
                            title: 'Billing',
                            context: 'user',
                            endpoint: 'billing',
                            target: 'billing',
                            url: '/dash/user/billing',
                            enabled: true,
                            visible: true,
                            element: <UserBillingPage />,
                            pages: null,
                            pageDataType: 'user',
                        },
                        {
                            title: 'User Page',
                            context: 'user',
                            endpoint: 'profile',
                            target: 'profile/*',
                            url: '/dash/user/profile',
                            enabled: true,
                            visible: true,
                            element: <UserProfilePage />,
                            pages: [
                                {
                                    title: 'User Profile',
                                    context: 'user',
                                    endpoint: 'profile',
                                    target: 'profile',
                                    url: '/dash/user/profile/:id',
                                    enabled: true,
                                    visible: true,
                                    element: <UserProfilePage editingMode={ false } />,
                                    pages: null,
                                    pageDataType: 'user',
                                },
                            ],
                            pageDataType: 'user',
                        },
                        {
                            title: 'Subscription',
                            context: 'user',
                            endpoint: 'subscription',
                            target: 'subscription',
                            url: '/dash/user/subscription',
                            enabled: true,
                            visible: true,
                            element: <UserSubscriptionStatus />,
                            pages: null,
                            pageDataType: 'user',
                        },
                        {
                            title: 'Your Settings',
                            context: 'user',
                            endpoint: 'settings',
                            target: 'settings/*',
                            url: '/dash/user/settings',
                            enabled: true,
                            visible: true,
                            element: <UserSettingsPage />,
                            pages: null,
                            pageDataType: 'user',
                        },
                    ],
                    location: 'nav-header',
                },
                {
                    title: 'Dashboard Home',
                    context: 'home',
                    endpoint: 'home',
                    target: 'home/*',
                    url: '/dash/home',
                    enabled: true,
                    visible: true,
                    element: <DashboardHomePage />,
                    useSidebar: true,
                    sidebarElement: <DashboardLeftSidebar />,
                    icon: LayoutDashboard,
                    showInMiniNav: true,
                    pages: null,
                    // pages: [
                    //     'log',
                    //     'goals',
                    //     'notepad',
                    //     'trackers',
                    //     'reminders',
                    //     'todaysAgenda',
                    // ],
                    location: 'nav-header',
                },
                {
                    title: 'Todo',
                    context: 'todo',
                    endpoint: 'todo',
                    target: 'todo/*',
                    url: '/dash/todo/kanban',
                    enabled: true,
                    visible: true,
                    element: <TodoPage />,
                    useSidebar: true,
                    sidebarElement: <TodoLeftSidebarContent />,
                    icon: WorkflowIcon,
                    showInMiniNav: true,
                    pages: [
                        {
                            title: 'kanban',
                            context: 'todo',
                            endpoint: 'kanban',
                            target: `/dash/todo/kanban`,
                            enabled: true,
                            visible: true,
                            element: <TodoPage />,
                            useSidebar: true,
                            sidebarElement: <ReflectStatsSidebar />,
                            pages: null
                        },
                        {
                            title: 'basic',
                            context: 'todo',
                            endpoint: 'basic',
                            target: `/dash/todo/basic`,
                            enabled: true,
                            visible: true,
                            element: <TodoPage />,
                            useSidebar: true,
                            sidebarElement: <ReflectStatsSidebar />,
                            pages: null
                        },
                        {
                            title: 'detailed',
                            context: 'todo',
                            endpoint: 'detailed',
                            target: `/dash/todo/detailed`,
                            enabled: true,
                            visible: true,
                            element: <TodoPage />,
                            useSidebar: true,
                            sidebarElement: <ReflectStatsSidebar />,
                            pages: null
                        },
                        {
                            title: 'table',
                            context: 'todo',
                            endpoint: 'table',
                            target: `/dash/todo/table`,
                            enabled: true,
                            visible: true,
                            element: <TodoPage />,
                            useSidebar: true,
                            sidebarElement: <ReflectStatsSidebar />,
                            pages: null
                        },
                        {
                            title: 'dataTable',
                            context: 'todo',
                            endpoint: 'dataTable',
                            target: `/dash/todo/dataTable`,
                            enabled: true,
                            visible: true,
                            element: <TodoPage />,
                            useSidebar: true,
                            sidebarElement: <ReflectStatsSidebar />,
                            pages: null
                        },
                        {
                            title: 'calendar',
                            context: 'todo',
                            endpoint: 'calendar',
                            target: `/dash/todo/calendar`,
                            enabled: true,
                            visible: true,
                            element: <TodoPage />,
                            useSidebar: true,
                            sidebarElement: <ReflectStatsSidebar />,
                            pages: null
                        },
                    ],
                    location: 'nav-header',
                    badge: getDataLengthSafe( tasksData ),
                },
                {
                    title: 'Planner',
                    context: 'planner',
                    endpoint: 'planner',
                    target: 'planner/*',
                    url: '/dash/planner/scheduler',
                    enabled: true,
                    visible: true,
                    element: <PlannerPage />,
                    useSidebar: true,
                    sidebarElement: <PlannerLeftSidebarContent />,
                    icon: CalendarIcon,
                    showInMiniNav: true,
                    pages: [
                        {
                            title: 'today',
                            context: 'planner',
                            endpoint: 'today',
                            target: 'today/*',
                            url: '/dash/planner/today',
                            enabled: true,
                            visible: true,
                            element: <TodayView title={ 'Happening Today' } />,
                            icon: CalendarIcon,
                            pages: null,
                        },
                        {
                            title: 'agenda',
                            context: 'planner',
                            endpoint: 'agenda',
                            target: 'agenda/*',
                            url: '/dash/planner/agenda',
                            enabled: true,
                            visible: true,
                            element: (
                                <EventAgenda
                                    eventsData={ eventsData }
                                    selectedDate={ selectedDate }
                                />
                            ),
                            icon: CalendarIcon,
                            pages: null,
                        },
                        {
                            title: 'scheduler',
                            context: 'planner',
                            endpoint: 'scheduler',
                            target: 'scheduler/*',
                            url: '/dash/planner/scheduler',
                            enabled: true,
                            visible: true,
                            element: <CalendarView />,
                            icon: CalendarIcon,
                            pages: null,
                        },
                        {
                            title: 'timeBlocks',
                            context: 'planner',
                            endpoint: 'timeBlocks',
                            target: 'timeBlocks/*',
                            url: '/dash/planner/timeBlocks',
                            enabled: true,
                            visible: true,
                            element: <TodayView title={ 'Time Blocks Visualizer' } />,
                            icon: CalendarIcon,
                            pages: null,
                        },
                        {
                            title: 'Logs',
                            context: 'planner',
                            endpoint: 'logs',
                            target: 'logs/*',
                            url: '/dash/planner/logs',
                            enabled: true,
                            visible: true,
                            element: <LogList />,
                            pages: [ // Journal/logs
                                {
                                    title: 'new',
                                    context: 'planner',
                                    endpoint: 'new',
                                    target: 'new/*',
                                    url: '/dash/planner/logs/new',
                                    enabled: true,
                                    visible: true,
                                    element: <LogCreate />,
                                    pages: null,
                                },
                                {
                                    title: ':id',
                                    context: 'planner',
                                    endpoint: ':id',
                                    target: ':id/*',
                                    url: '/dash/planner/logs/:id',
                                    enabled: true,
                                    visible: true,
                                    element: <LogDetail editingMode={ false } />,
                                    pages: [ // Planner/logs/:id
                                        {
                                            title: 'edit',
                                            context: 'planner',
                                            endpoint: 'edit',
                                            target: 'edit',
                                            url: '/dash/planner/logs/:id/edit',
                                            enabled: true,
                                            visible: true,
                                            element: <LogDetail editingMode={ false } />,
                                            pages: null,
                                            pageDataType: 'log',
                                        },
                                        {
                                            title: 'detail',
                                            context: 'planner',
                                            endpoint: 'detail',
                                            target: 'detail',
                                            url: '/dash/planner/logs/:id/detail',
                                            enabled: true,
                                            visible: true,
                                            element: <LogDetail editingMode={ false } />,
                                            pages: null,
                                            pageDataType: 'log',
                                        },
                                    ],
                                    pageDataType: 'log',
                                    getPages: () => {
                                        return getIdsOfType( 'log' );
                                    },
                                },
                                {
                                    title: 'calendar',
                                    context: 'planner',
                                    endpoint: 'calendar',
                                    target: 'calendar/*',
                                    url: '/dash/planner/logs/calendar',
                                    enabled: true,
                                    visible: true,
                                    element: <LogCalendarView items={ logsData } />,
                                    pages: null,
                                },
                            ],
                            location: 'nav-header',
                            badge: getDataLengthSafe( eventsData ),
                        },
                        {
                            title: 'Events',
                            context: 'planner',
                            endpoint: 'events',
                            target: 'events/*',
                            url: '/dash/planner/events',
                            enabled: true,
                            visible: true,
                            element: <EventList />,
                            pages: [ // Planner/events
                                {
                                    title: 'list',
                                    context: 'planner',
                                    endpoint: 'list',
                                    target: 'list',
                                    url: '/dash/planner/events/list',
                                    enabled: true,
                                    visible: true,
                                    element: <EventList />,
                                    pages: null,
                                    pageDataType: 'event',
                                },
                                {
                                    title: 'create',
                                    context: 'planner',
                                    endpoint: 'create',
                                    target: 'create/*',
                                    url: '/dash/planner/events/create',
                                    enabled: true,
                                    visible: true,
                                    element: <EventCreate parentPath={ `/dash/planner/events` } />,
                                    pages: null,
                                    pageDataType: 'event',
                                },
                                {
                                    title: ':id',
                                    context: 'planner',
                                    endpoint: ':id',
                                    target: ':id/*',
                                    url: '/dash/planner/events/:id',
                                    enabled: true,
                                    visible: true,
                                    element: <EventDetail editingMode={ false } parentPath={ `/dash/planner/events` } />,
                                    pages: [ // Planner/events/:id
                                        {
                                            title: 'detail',
                                            context: 'planner',
                                            endpoint: 'detail',
                                            target: 'detail/*',
                                            url: '/dash/planner/events/:id/detail',
                                            enabled: true,
                                            visible: true,
                                            element: <EventDetail editingMode={ false } parentPath={ `/dash/planner/events` } />,
                                            pages: null,
                                            pageDataType: 'event',
                                        },
                                        {
                                            title: 'edit',
                                            context: 'planner',
                                            endpoint: 'edit',
                                            target: 'edit/*',
                                            url: '/dash/planner/events/:id/edit',
                                            enabled: true,
                                            visible: true,
                                            element: <EventDetail editingMode={ true } parentPath={ `/dash/planner/events` } />,
                                            pages: null,
                                            pageDataType: 'event',
                                        }
                                    ],
                                    pageDataType: 'event',
                                    getPages: () => {
                                        let idRoutes = getIdsOfType( 'event' );
                                        if ( idRoutes && Array.isArray( idRoutes ) && idRoutes.length > 0 ) {
                                            idRoutes = idRoutes.map( ( route ) => ( {
                                                ...route,
                                                enabled: true,
                                                visible: true,
                                                title: `${ route?.endpoint || route?.title }`,
                                                context: `${ route?.context || route?.endpoint }`,
                                                endpoint: `${ route?.endpoint || route?.title }`,
                                                target: `${ route?.endpoint || route?.title }/*`,
                                                url: `/dash/planner/events/${ route?.endpoint || route?.title }`,
                                                element: <EventDetail editingMode={ false } parentPath={ `/dash/planner/events` } />,
                                                pages: null,
                                                getPages: () => ( [
                                                    {
                                                        title: 'detail',
                                                        context: 'planner',
                                                        endpoint: 'detail',
                                                        target: 'detail/*',
                                                        url: `/dash/planner/events/${ route?.endpoint || route?.title }/detail`,
                                                        enabled: true,
                                                        visible: true,
                                                        element: <EventDetail editingMode={ false } parentPath={ `/dash/planner/events` } />,
                                                        pages: null,
                                                    },
                                                    {
                                                        title: 'edit',
                                                        context: 'planner',
                                                        endpoint: 'edit',
                                                        target: 'edit/*',
                                                        url: `/dash/planner/events/${ route?.endpoint || route?.title }/edit`,
                                                        enabled: true,
                                                        visible: true,
                                                        element: <EventDetail editingMode={ true } parentPath={ `/dash/planner/events` } />,
                                                        pages: null,
                                                    }
                                                ] ),
                                                pageDataType: 'event',
                                            } ) );
                                        }
                                        return idRoutes;
                                    },
                                },
                            ],
                            location: 'nav-header',
                            badge: getDataLengthSafe( eventsData ),
                        },
                        {
                            title: 'Planners',
                            context: 'planner',
                            endpoint: 'planners',
                            target: 'planners/*',
                            url: '/dash/planner/planners',
                            enabled: true,
                            visible: true,
                            element: <PlannerList />,
                            pages: [ // Planner/planners
                                {
                                    title: 'new',
                                    context: 'planner',
                                    endpoint: 'new',
                                    target: 'new',
                                    url: '/dash/planner/planners/new',
                                    enabled: true,
                                    visible: true,
                                    element: <PlannerCreate />,
                                    pages: null,
                                },
                                {
                                    title: 'list',
                                    context: 'planner',
                                    endpoint: 'list',
                                    target: 'list/*',
                                    url: '/dash/planner/planners/list',
                                    enabled: true,
                                    visible: true,
                                    element: <PlannerList />,
                                    pages: null,
                                    pageDataType: 'planner',
                                },
                                {
                                    title: ':id',
                                    context: 'planner',
                                    endpoint: ':id',
                                    target: ':id/*',
                                    url: '/dash/planner/planners/:id',
                                    enabled: true,
                                    visible: true,
                                    element: <PlannerDetail editingMode={ false } />,
                                    pages: [
                                        {
                                            title: 'detail',
                                            context: 'planner',
                                            endpoint: 'detail',
                                            target: 'detail/*',
                                            url: '/dash/planner/planners/:id/detail',
                                            enabled: true,
                                            visible: true,
                                            element: <PlannerDetail editingMode={ false } />,
                                            pages: null,
                                            pageDataType: 'planner',
                                        },
                                        {
                                            title: 'edit',
                                            context: 'planner',
                                            endpoint: 'edit',
                                            target: 'edit/*',
                                            url: '/dash/planner/planners/:id/edit',
                                            enabled: true,
                                            visible: true,
                                            element: <PlannerDetail editingMode={ true } />,
                                            pages: null,
                                            pageDataType: 'planner',
                                        }
                                    ],
                                    pageDataType: 'planner',
                                },
                            ],
                            location: 'nav-header',
                            badge: getDataLengthSafe( plannerData ),
                        },
                        {
                            title: 'Calendars',
                            context: 'planner',
                            endpoint: 'calendars',
                            target: 'calendars/*',
                            url: '/dash/planner/calendars',
                            enabled: true,
                            visible: true,
                            // element: <CalendarList />,
                            pages: [ // Planner/calendars
                                {
                                    title: 'new',
                                    context: 'planner',
                                    endpoint: 'new',
                                    target: 'new',
                                    url: '/dash/planner/calendars/new',
                                    enabled: true,
                                    visible: true,
                                    element: <EventList />,
                                    pages: null,
                                    pageDataType: 'calendar',
                                },
                                {
                                    title: 'list',
                                    context: 'planner',
                                    endpoint: 'list',
                                    target: 'list/*',
                                    url: '/dash/planner/calendars/list',
                                    enabled: true,
                                    visible: true,
                                    element: <EventList />,
                                    pages: null,
                                    pageDataType: 'calendar',
                                },
                                {
                                    title: ':id',
                                    context: 'planner',
                                    endpoint: ':id',
                                    target: ':id/*',
                                    url: '/dash/planner/calendar/:id',
                                    enabled: true,
                                    visible: true,
                                    element: <EventDetail editingMode={ false } parentPath={ `/dash/planner/events` } />,
                                    pages: [
                                        {
                                            title: 'detail',
                                            context: 'planner',
                                            endpoint: 'detail',
                                            target: 'detail/*',
                                            url: '/dash/planner/calendar/:id/detail',
                                            enabled: true,
                                            visible: true,
                                            element: <EventDetail editingMode={ false } parentPath={ `/dash/planner/calendar` } />,
                                            pages: null,
                                            pageDataType: 'event',
                                        },
                                        {
                                            title: 'edit',
                                            context: 'planner',
                                            endpoint: 'edit',
                                            target: 'edit/*',
                                            url: '/dash/planner/calendar/:id/edit',
                                            enabled: true,
                                            visible: true,
                                            element: <EventDetail editingMode={ true } parentPath={ `/dash/planner/calendar` } />,
                                            pages: null,
                                            pageDataType: 'event',
                                        }
                                    ],
                                    pageDataType: 'event'
                                },
                            ],
                            location: 'nav-header',
                            badge: getDataLengthSafe( calendarsData ),
                        },
                    ],
                    location: 'nav-header',
                    // TODO :: Make a function in the plannerStore to get all events today, or upcoming in a set range of time.
                    // This means moving all those functions from the usePlanner hook to the plannerStore file.
                    badge: getDataLengthSafe( eventsData ),
                },
                {
                    title: 'Notes',
                    context: 'notes',
                    endpoint: 'notes',
                    target: 'notes/*',
                    url: '/dash/notes/explorer',
                    enabled: true,
                    visible: true,
                    element: <NotesPage />,
                    useSidebar: true,
                    sidebarElement: <NotesLeftSidebarContent />,
                    icon: Inbox,
                    showInMiniNav: true,
                    pages: [ // Notes
                        {
                            title: 'Scratch Pad',
                            context: 'notes',
                            endpoint: 'scratchPad',
                            target: 'scratchPad/*',
                            url: '/dash/notes/scratchPad',
                            enabled: true,
                            visible: true,
                            element: <>{ 'scratchPad' }</>,
                            icon: FileIcon,
                            pages: null,
                        },
                        {
                            title: 'explorer',
                            context: 'notes',
                            endpoint: 'explorer',
                            target: 'explorer/*',
                            url: '/dash/notes/explorer',
                            enabled: true,
                            visible: true,
                            element: <NotesPage />,
                            icon: FileIcon,
                            pages: null,
                        },
                        {
                            title: 'editor',
                            context: 'notes',
                            endpoint: 'editor',
                            target: 'editor/*',
                            url: '/dash/notes/editor',
                            enabled: true,
                            visible: true,
                            element: <NotesPage />,
                            icon: FileIcon,
                            pages: null,
                        },
                    ],
                    location: 'nav-header',
                    badge: getDataLengthSafe( recentNotesData ),
                },
                {
                    title: 'Reflect',
                    context: 'reflect',
                    endpoint: 'reflect',
                    target: 'reflect/*',
                    url: '/dash/reflect',
                    enabled: true,
                    visible: true,
                    element: <ReflectPage />,
                    useSidebar: true,
                    sidebarElement: <ReflectLeftSidebar />,
                    icon: Brain,
                    showInMiniNav: false,
                    pages: [ // Reflect/
                        {
                            title: 'Habits',
                            context: 'reflect',
                            endpoint: 'habits',
                            target: 'habits/*',
                            url: '/dash/reflect/habits',
                            enabled: true,
                            visible: true,
                            element: <ReflectPage />,
                            useSidebar: true,
                            sidebarElement: <PlannerLogRightSidebarContent />,
                            icon: HeartPulseIcon,
                            showInMiniNav: true,
                            pages: [ // Reflect/habits
                                {
                                    title: 'Habit Checklist',
                                    context: 'reflect',
                                    endpoint: 'table',
                                    target: 'table/*',
                                    url: '/dash/reflect/habits/table',
                                    enabled: true,
                                    visible: true,
                                    element: <HabitGanttView />,
                                    useSidebar: true,
                                    sidebarElement: <PlannerLogRightSidebarContent />,
                                    icon: ListIcon,
                                    pages: null,
                                },
                                {
                                    title: 'Habits Charts',
                                    context: 'reflect',
                                    endpoint: 'charts',
                                    target: 'charts/*',
                                    url: '/dash/reflect/habits/charts',
                                    enabled: true,
                                    visible: true,
                                    element: <HabitChartsView />,
                                    useSidebar: true,
                                    sidebarElement: <PlannerLogRightSidebarContent />,
                                    icon: ListIcon,
                                    pages: null,
                                },
                                {
                                    title: 'Habits Calendar',
                                    context: 'reflect',
                                    endpoint: 'calendar',
                                    target: 'calendar/*',
                                    url: '/dash/reflect/habits/calendar',
                                    enabled: true,
                                    visible: true,
                                    element: <HabitCalendarView />,
                                    useSidebar: true,
                                    sidebarElement: <PlannerLogRightSidebarContent />,
                                    icon: ListIcon,
                                    pages: null,
                                },
                                {
                                    title: 'Streaks Heatmap',
                                    context: 'reflect',
                                    endpoint: 'streaksHeatmap',
                                    target: 'streaksHeatmap/*',
                                    url: '/dash/reflect/habits/streaks',
                                    enabled: true,
                                    visible: true,
                                    element: <HabitStreaksView />,
                                    useSidebar: true,
                                    sidebarElement: <PlannerLogRightSidebarContent />,
                                    icon: ListIcon,
                                    pages: null,
                                },
                            ],
                            location: 'nav-header',
                        },
                        {
                            title: 'Stats',
                            context: 'reflect',
                            endpoint: 'stats',
                            target: 'stats/*',
                            url: '/dash/reflect/stats',
                            enabled: true,
                            visible: true,
                            element: <ReflectPage />,
                            useSidebar: true,
                            sidebarElement: <ReflectStatsSidebar />,
                            icon: GlassesIcon,
                            showInMiniNav: true,
                            pages: [ // Reflect/stats
                                {
                                    title: 'Stats Dashboard',
                                    context: 'reflect',
                                    endpoint: 'dashboard',
                                    target: 'dashboard/*',
                                    url: '/dash/reflect/stats/dashboard',
                                    enabled: true,
                                    visible: true,
                                    sidebarElement: <ReflectStatsSidebar />,
                                    useSidebar: true,
                                    element: <ReflectPage tab={ `dashboard` } />,
                                    icon: ListIcon,
                                    pages: null,
                                },
                                {
                                    title: 'Stats Data',
                                    context: 'reflect',
                                    endpoint: 'data',
                                    target: 'data/*',
                                    url: '/dash/reflect/stats/data',
                                    enabled: true,
                                    visible: true,
                                    sidebarElement: <ReflectStatsSidebar />,
                                    useSidebar: true,
                                    element: <ReflectPage tab={ `data` } />,
                                    icon: ListIcon,
                                    pages: null,
                                },
                                {
                                    title: 'Analysis',
                                    context: 'reflect',
                                    endpoint: 'analysis',
                                    target: 'analysis/*',
                                    url: '/dash/reflect/stats/analysis',
                                    enabled: true,
                                    visible: true,
                                    sidebarElement: <ReflectStatsSidebar />,
                                    useSidebar: true,
                                    element: <ReflectPage tab={ `analysis` } />,
                                    icon: ListIcon,
                                    pages: null,
                                },
                                {
                                    title: 'Calendar',
                                    context: 'reflect',
                                    endpoint: 'calendar',
                                    target: 'calendar/*',
                                    url: '/dash/reflect/stats/calendar',
                                    enabled: true,
                                    visible: true,
                                    sidebarElement: <ReflectStatsSidebar />,
                                    useSidebar: true,
                                    element: <ReflectPage tab={ `calendar` } />,
                                    icon: ListIcon,
                                    pages: null,
                                },
                            ],
                            location: 'nav-header',
                            badge: utils.val.isValidArray( statsData, true )
                                ? getDataLengthSafe( statsData )
                                : null,
                        },
                        {
                            title: 'Insights',
                            context: 'reflect',
                            endpoint: 'insights',
                            target: 'insights/*',
                            url: '/dash/reflect/insights',
                            enabled: true,
                            visible: true,
                            element: <ReflectPage />,
                            useSidebar: true,
                            sidebarElement: <ReflectStatsSidebar />,
                            icon: GlassesIcon,
                            showInMiniNav: true,
                            pages: [ // Reflect/insights
                                {
                                    title: 'Insights Overview',
                                    context: 'reflect',
                                    endpoint: 'overview',
                                    target: 'overview/*',
                                    url: '/dash/reflect/insights/overview',
                                    enabled: true,
                                    visible: true,
                                    element: <>{ `overview` }</>,
                                    icon: ListIcon,
                                    pages: null,
                                },
                                {
                                    title: 'Summarize',
                                    context: 'reflect',
                                    endpoint: 'summarize',
                                    target: 'summarize/*',
                                    url: '/dash/reflect/insights/summarize',
                                    enabled: true,
                                    visible: true,
                                    element: <>{ `summarize` }</>,
                                    icon: ListIcon,
                                    pages: null,
                                },
                                {
                                    title: 'Correlations',
                                    context: 'reflect',
                                    endpoint: 'correlations',
                                    target: 'correlations/*',
                                    url: '/dash/reflect/insights/correlations',
                                    enabled: true,
                                    visible: true,
                                    element: <>{ `correlations` }</>,
                                    icon: ListIcon,
                                    pages: null,
                                },
                                {
                                    title: 'Insights Heatmap',
                                    context: 'reflect',
                                    endpoint: 'heatmap',
                                    target: 'heatmap/*',
                                    url: '/dash/reflect/insights/heatmap',
                                    enabled: true,
                                    visible: true,
                                    element: <>{ `heatmap` }</>,
                                    icon: ListIcon,
                                    pages: null,
                                },
                                {
                                    title: 'Compare',
                                    context: 'reflect',
                                    endpoint: 'compare',
                                    target: 'compare/*',
                                    url: '/dash/reflect/insights/compare',
                                    enabled: true,
                                    visible: true,
                                    element: <>{ `compare` }</>,
                                    icon: ListIcon,
                                    pages: null,
                                },
                                {
                                    title: 'Trends',
                                    context: 'reflect',
                                    endpoint: 'trends',
                                    target: 'trends/*',
                                    url: '/dash/reflect/insights/trends',
                                    enabled: true,
                                    visible: true,
                                    element: <>{ `trends` }</>,
                                    icon: ListIcon,
                                    pages: null,
                                },
                                {
                                    title: 'Moods',
                                    context: 'reflect',
                                    endpoint: 'moods',
                                    target: 'moods/*',
                                    url: '/dash/reflect/insights/moods',
                                    enabled: true,
                                    visible: true,
                                    element: <>{ `moods` }</>,
                                    icon: ListIcon,
                                    pages: null,
                                },
                            ],
                            location: 'nav-header',
                            badge: utils.val.isValidArray( statsData, true )
                                ? getDataLengthSafe( statsData )
                                : null,
                        },
                        {
                            title: 'Journal',
                            context: 'reflect',
                            endpoint: 'journal',
                            target: 'journal/*',
                            url: '/dash/reflect/journal',
                            enabled: true,
                            visible: true,
                            element: <JournalPage />,
                            useSidebar: true,
                            sidebarElement: <PlannerLogRightSidebarContent />,
                            icon: BookHeartIcon,
                            showInMiniNav: true,
                            pages: [ // Reflect/journal
                                {
                                    title: 'Journal',
                                    context: 'reflect',
                                    endpoint: 'list',
                                    target: 'list/*',
                                    url: '/dash/reflect/journal/list',
                                    enabled: true,
                                    visible: true,
                                    element: (
                                        <LogList
                                            parentPath={ `/dash/reflect/journal` }
                                            logs={ logsData }
                                        />
                                    ),
                                    useSidebar: true,
                                    sidebarElement: <PlannerLogRightSidebarContent />,
                                    icon: ListIcon,
                                    pages: null,
                                    pageDataType: 'log',
                                },
                                {
                                    title: 'New Journal Entry',
                                    context: 'reflect',
                                    endpoint: 'new',
                                    target: 'new/*',
                                    url: '/dash/journal/new',
                                    enabled: true,
                                    visible: true,
                                    element: (
                                        <LogCreate
                                            parentPath={ `/dash/reflect/journal` }
                                            logSchema={ getSchema( 'log' ) }
                                            logDate={ selectedDate ?? new Date() }
                                        />
                                    ),
                                    useSidebar: true,
                                    sidebarElement: <PlannerLogRightSidebarContent />,
                                    icon: ListIcon,
                                    pages: null,
                                },
                                {
                                    title: 'Daily Entry',
                                    context: 'reflect',
                                    endpoint: 'dailylog',
                                    target: 'dailylog/*',
                                    url: '/dash/reflect/journal/dailylog',
                                    enabled: true,
                                    visible: true,
                                    element: (
                                        <LogCreate
                                            parentPath={ `/dash/reflect/journal` }
                                            logSchema={ getSchema( 'log' ) }
                                            logDate={ new Date( Date.now() ) }
                                        />
                                    ),
                                    useSidebar: true,
                                    sidebarElement: <PlannerLogRightSidebarContent />,
                                    icon: ListIcon,
                                    pages: null,
                                },
                                {
                                    title: 'Journal Entry',
                                    context: 'reflect',
                                    endpoint: ':id',
                                    target: ':id/*',
                                    url: '/dash/reflect/journal/:id',
                                    enabled: true,
                                    visible: true,
                                    element: (
                                        <LogDetail
                                            parentPath={ `/dash/reflect/journal` }
                                            editingMode={ false }
                                        />
                                    ),
                                    useSidebar: true,
                                    sidebarElement: <PlannerLogRightSidebarContent />,
                                    pages: [ // Reflect/journal/:id
                                        {
                                            title: 'Edit Journal Entry',
                                            context: 'reflect',
                                            endpoint: 'edit',
                                            target: 'edit',
                                            url: '/dash/reflect/journal/:id/edit',
                                            enabled: true,
                                            visible: true,
                                            element: (
                                                <LogDetail
                                                    parentPath={ `/dash/reflect/journal` }
                                                    editingMode={ true }
                                                />
                                            ),
                                            pages: null,
                                        },
                                        {
                                            title: 'Journal Entry Details',
                                            context: 'reflect',

                                            endpoint: 'detail',
                                            target: 'detail',
                                            url: '/dash/reflect/journal/:id/detail',
                                            enabled: true,
                                            visible: true,
                                            element: (
                                                <LogDetail
                                                    parentPath={ `/dash/reflect/journal` }
                                                    editingMode={ false }
                                                />
                                            ),
                                            pages: null,
                                        },
                                    ],
                                    pageDataType: 'log',
                                    getPages: () => {
                                        return getIdsOfType( 'log' );
                                    },
                                },
                                {
                                    title: 'Journaling Calendar',
                                    context: 'reflect',
                                    endpoint: 'calendar',
                                    target: 'calendar/*',
                                    url: '/dash/reflect/journal/calendar',
                                    enabled: true,
                                    visible: true,
                                    element: <LogCalendarView /* items={ logsData } */ />,
                                    icon: ListIcon,
                                    pages: null,
                                },
                                {
                                    title: 'Journaling Log Schema',
                                    context: 'reflect',
                                    endpoint: 'schema',
                                    target: 'schema/*',
                                    url: '/dash/reflect/journal/schema',
                                    enabled: true,
                                    visible: true,
                                    element: (
                                        <LogSchemaView
                                            parentPath={ `/dash/reflect/journal` }
                                            logSchema={ getSchema( 'log' ) }
                                            schemas={ schemas }
                                        />
                                    ),
                                    icon: ListIcon,
                                    pages: null,
                                },
                            ],
                            location: 'nav-header',
                            // Show an alert icon if the user has not logged their day today yet.
                            badge: logsData?.find( ( log ) =>
                                isSameDay( log?.date, new Date( Date.now() ) ) ? '!' : null,
                            ),
                        },
                    ],
                    location: 'nav-header',
                },
                {
                    title: 'Focus & Time Management',
                    context: 'time',
                    endpoint: 'time',
                    target: 'time/*',
                    url: '/dash/time',
                    enabled: true,
                    visible: true,
                    element: <TimePage />,
                    useSidebar: false,
                    sidebarElement: null,
                    icon: Clock,
                    showInMiniNav: true,
                    pages: [ // Time/
                        {
                            title: 'Timers',
                            context: 'time',
                            endpoint: 'timers',
                            target: 'timers/*',
                            url: '/dash/time/timers',
                            element: (
                                <Timeblocks
                                    title={ 'timers' }
                                    selectedDate={ selectedDate }
                                    setSelectedDate={ setSelectedDate }
                                >
                                    <CountdownTimers />
                                </Timeblocks>
                            ),
                            icon: Clock10Icon,
                            enabled: true,
                            visible: true,
                            pages: null,
                        },
                        {
                            title: 'Visualizer',
                            context: 'time',
                            endpoint: 'timeBlockVisualizer',
                            target: 'timeBlockVisualizer/*',
                            url: '/dash/time/timeBlockVisualizer',
                            element: (
                                <EnhancedTimeGrid
                                    title={ 'timeBlockVisualizer' }
                                    selectedDate={ selectedDate }
                                    setSelectedDate={ setSelectedDate }
                                    mode={ 'default' }
                                    className={ `` }
                                />
                            ),
                            icon: Clock10Icon,
                            enabled: true,
                            visible: true,
                            pages: null,
                        },
                        // A gantt chart style vertical list with horizontal lines, time on horizontal axis, each row is a day, each day showing how blocks of time were spent.
                        {
                            title: 'Time Blocks Gantt',
                            context: 'time',
                            endpoint: 'timeBlocksGantt',
                            target: 'timeBlocksGantt/*',
                            url: '/dash/time/timeBlocksGantt',
                            element: <>{ `timeBlocksGantt` }</>,
                            icon: Clock10Icon,
                            enabled: true,
                            visible: true,
                            pages: null,
                        },
                        {
                            title: 'Pomodoro Timer',
                            context: 'time',
                            endpoint: 'focus',
                            target: 'focus/*',
                            url: '/dash/time/focus',
                            element:
                                <PomodoroTimer
                                    title={ 'focus' }
                                    mode={ 'default' }
                                    className={ `` }
                                />,
                            icon: Clock10Icon,
                            enabled: true,
                            visible: true,
                            pages: null,
                        },
                        {
                            title: 'Today',
                            context: 'time',
                            endpoint: 'today',
                            target: 'today/*',
                            url: '/dash/time/today',
                            element:
                                <TodayView
                                    title={ 'today' }
                                    mode={ 'default' }
                                    className={ '' }
                                />,
                            icon: Clock10Icon,
                            enabled: true,
                            visible: true,
                            pages: null,
                        },
                        {
                            title: 'Heatmap',
                            context: 'time',
                            endpoint: 'heatmap',
                            target: 'heatmap/*',
                            url: '/dash/time/heatmap',
                            element:
                                <TimeHeatmap
                                    title={ 'heatmap' }
                                    selectedDate={ selectedDate }
                                    setSelectedDate={ setSelectedDate }
                                />,
                            icon: Clock10Icon,
                            enabled: true,
                            visible: true,
                            pages: null,
                        },
                        {
                            title: 'My Year To Date',
                            context: 'time',
                            endpoint: 'myYear',
                            target: 'myYear/*',
                            url: '/dash/time/myYear',
                            element: <>{ `myYear` }</>,
                            icon: Clock10Icon,
                            enabled: true,
                            visible: true,
                            pages: null,
                        },
                    ],
                    location: 'nav-header',
                },
                {
                    title: 'Orion',
                    context: 'orion',
                    endpoint: 'orion',
                    target: 'orion/*',
                    url: '/dash/orion',
                    enabled: true,
                    visible: true,
                    element: <AIPage />,
                    useSidebar: false,
                    sidebarElement: null,
                    icon: Sparkles,
                    showInMiniNav: true,
                    pages: [ // Orion/ // Iroop
                        {
                            title: 'Home',
                            context: 'orion',
                            endpoint: 'home',
                            target: 'home/*',
                            url: '/dash/orion/home',
                            icon: SparkleIcon,
                            element: <AIPagePlatform view={ `home` } />,
                        },
                        {
                            title: 'Chats',
                            context: 'orion',
                            endpoint: 'chats',
                            target: 'chats/*',
                            url: '/dash/orion/chats',
                            icon: SparkleIcon,
                            element: <AIPagePlatform view={ `chats` } />,
                        },
                        {
                            title: 'Config',
                            context: 'orion',
                            endpoint: 'config',
                            target: 'config/*',
                            url: '/dash/orion/config',
                            icon: SparkleIcon,
                            element: <AIPagePlatform view={ `config` } />,
                        },
                    ],
                    location: 'nav-header',
                },
                {
                    title: 'Search',
                    context: 'none',
                    endpoint: 'search',
                    target: 'search/*',
                    url: '/dash/search',
                    enabled: false,
                    visible: true,
                    element: <SearchPage />,
                    useSidebar: false,
                    sidebarElement: null,
                    icon: Search,
                    showInMiniNav: false,
                    pages: null,
                    location: 'nav-footer',
                },
                {
                    title: 'Workspaces',
                    context: 'workspaces',
                    endpoint: 'workspaces',
                    target: 'workspaces/*',
                    url: '/dash/workspaces',
                    enabled: true,
                    visible: true,
                    element: <WorkspacesPage />,
                    useSidebar: true,
                    sidebarElement: <WorkspacesLeftSidebarContent />,
                    icon: Blocks,
                    showInMiniNav: true,
                    pages: null,
                    location: 'nav-footer',
                    badge: getDataLengthSafe( workspacesData ),
                },
                {
                    title: 'Messages',
                    context: 'messages',
                    endpoint: 'messages',
                    target: 'messages/*',
                    url: '/dash/messages',
                    enabled: true,
                    visible: true,
                    element: <RemindersPage defaultEndpoint={ null } />,
                    useSidebar: true,
                    sidebarElement: <ReminderLeftSidebar />,
                    icon: AlertCircleIcon,
                    showInMiniNav: true,
                    pages: [ // Messages/
                        {
                            title: 'home',
                            context: 'messages',
                            endpoint: 'home',
                            target: 'home/*',
                            url: '/dash/messages/home',
                            enabled: true,
                            visible: true,
                            element: <>{ 'home' }</>,
                            icon: Home,
                        },
                        {
                            title: 'inbox',
                            context: 'messages',
                            endpoint: 'inbox',
                            target: 'inbox/*',
                            url: '/dash/messages/inbox',
                            enabled: true,
                            visible: true,
                            element: <>{ 'inbox' }</>,
                            icon: InboxIcon,
                        },
                        {
                            title: 'Reminders',
                            context: 'messages',
                            endpoint: 'reminders',
                            target: 'reminders/*',
                            url: '/dash/messages/reminders',
                            enabled: true,
                            visible: true,
                            element: <RemindersPage defaultEndpoint={ 'reminders' } />,
                            useSidebar: true,
                            sidebarElement: <ReminderLeftSidebar />,
                            icon: AlertCircle,
                            showInMiniNav: false,
                            pages: null,
                            location: 'nav-footer',
                        },
                        {
                            title: 'Notifications',
                            context: 'messages',
                            endpoint: 'notifications',
                            target: 'notifications/*',
                            url: '/dash/messages/notifications',
                            enabled: true,
                            visible: true,
                            element: <RemindersPage defaultEndpoint={ 'notifications' } />,
                            useSidebar: true,
                            sidebarElement: <ReminderLeftSidebar />,
                            icon: BellRing,
                            showInMiniNav: false,
                            pages: [ 'all', 'unread', 'dismissed', 'history' ],
                            location: 'nav-footer',
                        },
                        {
                            title: 'History',
                            context: 'messages',
                            endpoint: 'history',
                            target: 'history/*',
                            url: '/dash/messages/history',
                            enabled: true,
                            visible: true,
                            element: <>{ 'history' }</>,
                            icon: InboxIcon,
                        },
                    ],
                    location: 'nav-footer',
                    badge: utils.val.isValidArray( remindersData, true )
                        ? getDataLengthSafe( remindersData )
                        : null,
                },
                {
                    title: 'Trash',
                    context: 'trash',
                    endpoint: 'trash',
                    target: 'trash/*',
                    url: '/dash/trash',
                    enabled: true,
                    visible: true,
                    element: <TrashPage />,
                    useSidebar: false,
                    sidebarElement: null,
                    icon: Trash2,
                    showInMiniNav: false,
                    pages: [ // Trash/
                        {
                            title: 'all',
                            context: 'trash',
                            endpoint: 'all',
                            target: 'all/*',
                            url: '/dash/trash/all',
                            element: <TrashPage defaultView={ 'all' } />,
                        },
                        {
                            title: 'stats',
                            context: 'trash',
                            endpoint: 'stats',
                            target: 'stats/*',
                            url: '/dash/trash/stats',
                            element: <TrashPage defaultView={ 'stats' } />
                        },
                        {
                            title: 'files',
                            context: 'trash',
                            endpoint: 'files',
                            target: 'files/*',
                            url: '/dash/trash/files',
                            element: <TrashPage defaultView={ 'files' } />
                        },
                        {
                            title: 'folders',
                            context: 'trash',
                            endpoint: 'folders',
                            target: 'folders/*',
                            url: '/dash/trash/folders',
                            element: <TrashPage defaultView={ 'folders' } />
                        },
                        {
                            title: 'recentNotes',
                            context: 'trash',
                            endpoint: 'recentNotes',
                            target: 'recentNotes/*',
                            url: '/dash/trash/recentNotes',
                            element: <TrashPage defaultView={ 'recentNotes' } />
                        },
                        {
                            title: 'planner',
                            context: 'trash',
                            endpoint: 'planner',
                            target: 'planner/*',
                            url: '/dash/trash/planner',
                            element: <TrashPage defaultView={ 'planner' } />
                        },
                        {
                            title: 'events',
                            context: 'trash',
                            endpoint: 'events',
                            target: 'events/*',
                            url: '/dash/trash/events',
                            element: <TrashPage defaultView={ 'events' } />
                        },
                        {
                            title: 'logs',
                            context: 'trash',
                            endpoint: 'logs',
                            target: 'logs/*',
                            url: '/dash/trash/logs',
                            element: <TrashPage defaultView={ 'logs' } />
                        },
                        {
                            title: 'calendars',
                            context: 'trash',
                            endpoint: 'calendars',
                            target: 'calendars/*',
                            url: '/dash/trash/calendars',
                            element: <TrashPage defaultView={ 'calendars' } />
                        },
                        {
                            title: 'tasks',
                            context: 'trash',
                            endpoint: 'tasks',
                            target: 'tasks/*',
                            url: '/dash/trash/tasks',
                            element: <TrashPage defaultView={ 'tasks' } />
                        },
                        {
                            title: 'goals',
                            context: 'trash',
                            endpoint: 'goals',
                            target: 'goals/*',
                            url: '/dash/trash/goals',
                            element: <TrashPage defaultView={ 'goals' } />
                        },
                        {
                            title: 'todoLists',
                            context: 'trash',
                            endpoint: 'todoLists',
                            target: 'todoLists/*',
                            url: '/dash/trash/todoLists',
                            element: <TrashPage defaultView={ 'todoLists' } />
                        },
                        {
                            title: 'todoListGroups',
                            context: 'trash',
                            endpoint: 'todoListGroups',
                            target: 'todoListGroups/*',
                            url: '/dash/trash/todoListGroups',
                            element: <TrashPage defaultView={ 'todoListGroups' } />
                        },
                        {
                            title: 'workspaces',
                            context: 'trash',
                            endpoint: 'workspaces',
                            target: 'workspaces/*',
                            url: '/dash/trash/workspaces',
                            element: <TrashPage defaultView={ 'workspaces' } />
                        },
                        {
                            title: 'notifications',
                            context: 'trash',
                            endpoint: 'notifications',
                            target: 'notifications/*',
                            url: '/dash/trash/notifications',
                            element: <TrashPage defaultView={ 'notifications' } />
                        },
                        {
                            title: 'reminders',
                            context: 'trash',
                            endpoint: 'reminders',
                            target: 'reminders/*',
                            url: '/dash/trash/reminders',
                            element: <TrashPage defaultView={ 'reminders' } />
                        },
                    ],
                    location: 'nav-footer',
                    badge: getTrash(),
                },
                {
                    title: 'Settings',
                    context: 'settings',
                    endpoint: 'settings',
                    target: 'settings/*',
                    url: '/dash/settings',
                    enabled: true,
                    visible: true,
                    element: <SettingsPage />,
                    useSidebar: false,
                    sidebarElement: null,
                    icon: CogIcon,
                    showInMiniNav: true,
                    pages: [ // Settings/
                        {
                            title: 'home',
                            context: 'settings',
                            endpoint: 'home',
                            target: 'home/*',
                            url: '/dash/settings/home',
                        },
                        {
                            title: 'notifications',
                            context: 'settings',
                            endpoint: 'notifications',
                            target: 'notifications/*',
                            url: '/dash/settings/notifications',
                        },
                        {
                            title: 'navigation',
                            context: 'settings',
                            endpoint: 'navigation',
                            target: 'navigation/*',
                            url: '/dash/settings/navigation',
                        },
                        {
                            title: 'appearance',
                            context: 'settings',
                            endpoint: 'appearance',
                            target: 'appearance/*',
                            url: '/dash/settings/appearance',
                        },
                        {
                            title: 'messages-media',
                            context: 'settings',
                            endpoint: 'messages-media',
                            target: 'messages-media/*',
                            url: '/dash/settings/messages-media',
                        },
                        {
                            title: 'language-region',
                            context: 'settings',
                            endpoint: 'language-region',
                            target: 'language-region/*',
                            url: '/dash/settings/language-region',
                        },
                        {
                            title: 'accessibility',
                            context: 'settings',
                            endpoint: 'accessibility',
                            target: 'accessibility/*',
                            url: '/dash/settings/accessibility',
                        },
                        {
                            title: 'mark-as-read',
                            context: 'settings',
                            endpoint: 'mark-as-read',
                            target: 'mark-as-read/*',
                            url: '/dash/settings/mark-as-read',
                        },
                        {
                            title: 'audio-video',
                            context: 'settings',
                            endpoint: 'audio-video',
                            target: 'audio-video/*',
                            url: '/dash/settings/audio-video',
                        },
                        {
                            title: 'connected-accounts',
                            context: 'settings',
                            endpoint: 'connected-accounts',
                            target: 'connected-accounts/*',
                            url: '/dash/settings/connected-accounts',
                        },
                        {
                            title: 'privacy-visibility',
                            context: 'settings',
                            endpoint: 'privacy-visibility',
                            target: 'privacy-visibility/*',
                            url: '/dash/settings/privacy-visibility',
                        },
                        {
                            title: 'advanced',
                            context: 'settings',
                            endpoint: 'advanced',
                            target: 'advanced/*',
                            url: '/dash/settings/advanced',
                        },
                    ],
                    location: 'nav-footer',
                },
                {
                    title: 'Help',
                    context: 'help',
                    endpoint: 'help',
                    target: 'help/*',
                    url: '/dash/help',
                    enabled: true,
                    visible: true,
                    element: <HelpDropdown />,
                    useSidebar: false,
                    sidebarElement: (
                        <>{ `Put a list of help topics here; clicking on one sends the user to a subpage endpoint.` }</>
                    ),
                    icon: MessageCircleQuestion,
                    showInMiniNav: false,
                    pages: null,
                    location: 'nav-footer',
                },
            ],
            location: 'nav-header',
        },
    ];

    // Object-Array defining all of the user-related buttons.
    let userNavConfig = {
        nav: [
            {
                enabled: true,
                visible: true,
                type: 'render',
                onRender: ( user ) => {
                    return (
                        <UserSubscriptionStatus user={ user } />
                    );
                },
                icon: <BadgeCheck />,
            },
            {
                label: 'Profile',
                enabled: true,
                visible: true,
                type: 'button',
                onClick: () => {
                    navigate( '/dash/user/profile' );
                },
                icon: <UserCircle2Icon />,
            },
            {
                label: 'Account',
                enabled: true,
                visible: true,
                type: 'button',
                onClick: () => {
                    navigate( '/dash/user/settings' );
                },
                icon: <UserCog2Icon />,
            },
            // {
            //     label: 'User Settings',
            //     enabled: true,
            //     visible: true,
            //     type: 'button',
            //     onClick: () => {
            //         // if ( !settingsDialogOpen ) setSettingsDialogOpen( true );
            //         navigate( '/dash/user/settings' );
            //     },
            //     icon: <BadgeCheck />,
            // },
            {
                label: 'Billing',
                enabled: true,
                visible: true,
                type: 'button',
                onClick: () => {
                    navigate( '/dash/user/billing' );
                },
                icon: <FaFileInvoice />,
            },
            {
                type: 'separator',
            },
            {
                type: 'group',
                nav: [
                    {
                        label: 'Settings',
                        enabled: true,
                        visible: true,
                        type: 'button',
                        onClick: () => {
                            // Open a modal with all user settings.
                            if ( !settingsDialogOpen )
                                setSettingsDialogOpen( true );
                        },
                        icon: <Cog />,
                    },
                    {
                        label: 'Notifications',
                        enabled: true,
                        visible: true,
                        type: 'button',
                        onClick: () => {
                            // Open a dropdown with all notifications displayed.
                            if ( !settingsDialogOpen )
                                setSettingsDialogOpen( true );
                        },
                        icon: <Bell />,
                    },
                ],
            },
            {
                type: 'separator',
            },
            {
                label: 'Log Out',
                enabled: true,
                visible: true,
                type: 'button',
                onClick: () => {
                    // Release token.
                    DeleteToken();
                    navigate( '/login' );
                },
                icon: <LogOut />,
            },
        ],
    };

    // Object-Array defining all of the user-related buttons.
    // if ( debug ) console.log( 'Dashboard :: renderContent :: dashboardActive = ', dashboardActive );

    const getNavButtons = () => { };

    const getSubPathsOfEndpoint = ( path = [] ) => {
        // Get any subpaths of the a page at the end of the provided path.
        let subpaths = [];
        let endpointConfig;
        let pathConfig = [ ...routesConfig ];
        if ( utils.val.isValidArray( path, true ) ) {
            path.forEach( ( token, index ) => {
                if ( token && token !== 'dash' ) {
                    // Ignore the 'dash/' prefix.
                    // Check to see if this token is found as one of the titles of the nav items
                    if ( utils.val.isDefined( pathConfig ) ) {
                        // Don't search pathConfig if it was nulled out in a previous step.
                        let pathConfig = pathConfig?.find(
                            ( route ) => route?.endpoint === token,
                        );
                        if ( pathConfig ) {
                            // Valid path token, proceed to next one.
                            if (
                                pathConfig?.hasOwnProperty( 'pages' ) &&
                                utils.val.isValidArray( pathConfig?.pages, true )
                            ) {
                                if ( index < path.length - 1 ) {
                                    // Not at last token, check to make sure we have pages defined.
                                    pathConfig = pathConfig.pages;
                                }
                                else {
                                    // At last token, return result.
                                    // pathConfig = pathConfig?.pages;
                                    return pathConfig;
                                }
                            } else {
                                // No defined pages. It's possible that this endpoint has dynamic page definitions found at pageDataType and getPages(). 

                                if (
                                    pathConfig
                                    && pathConfig?.hasOwnProperty( 'pageDataType' )
                                    && pathConfig.pageDataType
                                    && pathConfig.pageDataType !== ''
                                ) {
                                    pathConfig = getIdsOfType( pathConfig.pageDataType ) || [];
                                    if ( pathConfig && Array.isArray( pathConfig ) && pathConfig.length > 0 ) {

                                    }
                                }
                                else if (
                                    pathConfig
                                    && pathConfig?.hasOwnProperty( 'getPages' )
                                    && pathConfig.getPages
                                    && typeof pathConfig.getPages === 'function'
                                ) {
                                    pathConfig = pathConfig.getPages || [];
                                }
                                else {
                                    // Nothing to do here, stop here. 
                                    pathConfig = null;
                                    return;
                                }
                            }
                        } else {
                            pathConfig = null;
                        }
                    }
                }
            } );
        }
        return pathConfig;
    };

    const getConfigOfEndpoint = ( path = [] ) => {
        // Get any subpaths of the a page at the end of the provided path.
        let subpaths = [];
        let endpointConfig;
        let pathConfig = [ ...routesConfig ];
        if ( utils.val.isValidArray( path, true ) ) {
            path.forEach( ( token, index ) => {
                if ( token && token !== 'dash' ) {
                    // Ignore the 'dash/' prefix.
                    // Check to see if this token is found as one of the titles of the nav items
                    if ( utils.val.isDefined( pathConfig ) ) {
                        // Don't search pathConfig if it was nulled out in a previous step.
                        let pathConfig = pathConfig?.find(
                            ( route ) => route?.endpoint === token,
                        );
                        if ( pathConfig ) {
                            // Valid path token, proceed to next one.

                            if ( index < path.length - 1 ) {
                                // Not at last token, check to make sure we have pages defined.
                                pathConfig = pathConfig.pages;
                                if (
                                    pathConfig?.hasOwnProperty( 'pages' ) &&
                                    utils.val.isValidArray( pathConfig?.pages, true )
                                ) {
                                    pathConfig = pathConfig.pages;
                                } else {
                                    // No defined pages to continue down, stop here.
                                    pathConfig = null;
                                    return;
                                }
                            }
                            else {
                                // At last token, return result.
                                // pathConfig = pathConfig?.pages;
                                return pathConfig;
                            }
                        } else {
                            pathConfig = null;
                        }
                    }
                }
            } );
        }

        return pathConfig;
    };

    const getSubPathsOfPage = () => {
        // Get any subpaths of the current page.
        // let subpaths = [];
        // let endpointConfig;
        // let pathConfig = [ ...routesConfig ];
        let paths = getSubPathsOfEndpoint( path );
        if ( paths ) {
            return paths;
        } else {
            return null;
        }
    };

    const buildBreadcrumbs =
        useCallback(
            () => {
                let tempLocalPath = [];
                let tempPathTokenConfig;
                let tempRoutesConfig = [ ...routesConfig ];
                let sameLevelOptions = []; // Other paths available at this token's endpoint. 
                let nextLevelOptions = [];
                let nextLevelConfig = []; // Subpaths available at this token's endpoint. 

                let pathBreadcrumbs =
                    path
                        ?.filter( ( x ) => x )
                        ?.map( ( token ) => {

                            if ( debug === true )
                                console.log(
                                    "NavProvider :: buildBreadcrumbs",
                                    "\n :: VALUES :: BEFORE :: ",
                                    "\n :: tempLocalPath = ", tempLocalPath,
                                    "\n :: tempPathTokenConfig = ", tempPathTokenConfig,
                                    "\n :: tempRoutesConfig = ", tempRoutesConfig,
                                    "\n :: sameLevelOptions = ", sameLevelOptions,
                                    "\n :: nextLevelConfig = ", nextLevelConfig,
                                );

                            // Append token to the temp local path variable.
                            tempLocalPath.push( token );

                            // Check to see if this token is an ObjectId. In which case, we process a bit differently. 
                            if ( isObjectId( token ) ) {
                                // Dynamic routes created from documents

                                console.log( "NavProvider :: token = ", token, " :: ", "Token is an ObjectID" );

                                // Replace the :id with the actual token's value for sending off to the breadcrumbs component's navigation functions. 
                                tempRoutesConfig = tempRoutesConfig?.map( ( route ) => ( {
                                    ...route,
                                    title: route?.title?.replace( ':id', token ),
                                    endpoint: route?.endpoint?.replace( ':id', token ),
                                    target: route?.target?.replace( ':id', token ),
                                    url: route?.url?.replace( ':id', token ),
                                } ) );

                                // Now that we can locate the config for this token, do so. 
                                tempPathTokenConfig = tempRoutesConfig?.find( ( route ) => route?.endpoint === token );

                                // Check if token config has a declared pageDataType. 
                                // If so, use it to generate an array of all available sameLevelRoutes. 

                                if (
                                    tempPathTokenConfig
                                    && tempPathTokenConfig?.hasOwnProperty( 'pageDataType' )
                                    && tempPathTokenConfig.pageDataType
                                    && tempPathTokenConfig.pageDataType !== ''
                                ) {
                                    // sameLevelOptions = getIdsOfType( tempPathTokenConfig.pageDataType ) || [];
                                    // if ( sameLevelOptions && Array.isArray( sameLevelOptions ) && sameLevelOptions.length > 0 ) {
                                    //     sameLevelOptions = sameLevelOptions.map( ( item, index ) => ( {
                                    //         value: item?._id || item?.id,
                                    //         endpoint: item?._id || item?.id,
                                    //         label: item?.title || item?.name,
                                    //         index: index,
                                    //     } ) );
                                    // }

                                    sameLevelOptions = getRoutesOfType( tempPathTokenConfig.pageDataType ) || [];
                                }

                                // For any dynamic page list borne of a list of ObjectIds, there will be a consistent subpath structure of: [ "edit", "detail" ]

                                if ( utils.val.isValidArray( sameLevelOptions, true ) ) {
                                    // nextLevelConfig = sameLevelOptions.map( ( route ) => ( {
                                    //     title: `${ route.endpoint }`,
                                    //     endpoint: `${ route.value }`,
                                    //     target: `${ route.value }/*`,
                                    //     url: `${ tempPathTokenConfig?.url || tempLocalPath.join( '/' ) }/${ route.value }`,
                                    //     enabled: true,
                                    //     element: tempPathTokenConfig?.element || <>{ `Element for ${ route.endpoint }` }</>,
                                    //     pages: [
                                    //         {
                                    //             title: `${ route.endpoint } - Detail`,
                                    //             endpoint: `${ route.value }`,
                                    //             target: `${ route.value }/*`,
                                    //             url: `${ tempPathTokenConfig?.url || tempLocalPath.join( '/' ) }/${ route.value }/detail`,
                                    //             enabled: true,
                                    //             element: tempPathTokenConfig?.element || <>{ `Element for ${ route.endpoint }` }</>,
                                    //             pages: null,
                                    //         },
                                    //         {
                                    //             title: `${ route.endpoint } - Edit`,
                                    //             endpoint: `${ route.value }`,
                                    //             target: `${ route.value }/*`,
                                    //             url: `${ tempPathTokenConfig?.url || tempLocalPath.join( '/' ) }/${ route.value }/edit`,
                                    //             enabled: true,
                                    //             element: tempPathTokenConfig?.element || <>{ `Element for ${ route.endpoint }` }</>,
                                    //             pages: null,
                                    //         },
                                    //     ],
                                    //     ...route
                                    // } ) );

                                    let tokenConfigEndpoint =
                                        utils.val.isObject( tempPathTokenConfig )
                                            && tempPathTokenConfig?.hasOwnProperty( 'endpoint' )
                                            ? tempPathTokenConfig?.endpoint
                                            : tempPathTokenConfig;

                                    nextLevelOptions = [
                                        {
                                            // title: `Detail`,
                                            title: `${ tokenConfigEndpoint } - Detail`,
                                            endpoint: `detail`,
                                            target: `${ tokenConfigEndpoint }/*`,
                                            element: tempPathTokenConfig?.element || <>{ `Element for ${ tokenConfigEndpoint }/detail` }</>,
                                            pages: null,
                                        },
                                        {
                                            // title: `Edit`,
                                            title: `${ tokenConfigEndpoint } - Edit`,
                                            endpoint: `edit`,
                                            target: `${ tokenConfigEndpoint }/*`,
                                            element: tempPathTokenConfig?.element || <>{ `Element for ${ tempPathTokenConfig?.hasOwnProperty( 'endpoint' ) ? tempPathTokenConfig?.endpoint : tempPathTokenConfig }/edit` }</>,
                                            pages: null,
                                        },
                                    ];
                                }



                                if ( tempPathTokenConfig ) {
                                    // nextLevelConfig = getIdsOfType( tempPathTokenConfig.pageDataType ) || [];

                                    return {
                                        // endpoint: tempPathTokenConfig?.endpoint || token,
                                        endpoint: `${ token }` || tempPathTokenConfig?.endpoint,
                                        url: `${ tempLocalPath.join( '/' ) }/detail` || tempPathTokenConfig?.url,
                                        title: caseCamelToSentence( token ) || tempPathTokenConfig?.title,
                                        label: caseCamelToSentence( token ) || tempPathTokenConfig?.title,
                                        options: sameLevelOptions,
                                    };
                                }
                            }

                            else {
                                // Static defined routes, proceed as normal. 

                                // Get the full config at this token. 
                                tempPathTokenConfig = tempRoutesConfig?.find( ( route ) => route?.endpoint === token );

                                // Populate same level options by getting values from all objects in tempRoutesConfig's current layer. 
                                // As we go from token to token, tempRoutesConfig is changed to the same level as the current token.
                                sameLevelOptions = tempRoutesConfig.map( ( route ) => ( route?.endpoint ) );

                                // Use the temp local path to get subpaths of this token, if applicable.
                                if (
                                    tempPathTokenConfig?.hasOwnProperty( 'pages' )
                                    && tempPathTokenConfig.pages
                                    && Array.isArray( tempPathTokenConfig.pages )
                                    && tempPathTokenConfig.pages.length > 0
                                ) {
                                    nextLevelConfig = tempPathTokenConfig.pages || [];
                                }

                                // Find the full config for this token.
                                // tempRoutesConfig = tempRoutesConfig?.find( ( route ) => route?.endpoint === token );
                                tempRoutesConfig = nextLevelConfig;

                                if ( debug === true )
                                    console.log(
                                        "NavProvider :: buildBreadcrumbs",
                                        "\n :: VALUES :: AFTER :: ",
                                        "\n :: tempLocalPath = ", tempLocalPath,
                                        "\n :: tempPathTokenConfig = ", tempPathTokenConfig,
                                        "\n :: tempRoutesConfig = ", tempRoutesConfig,
                                        "\n :: sameLevelOptions = ", sameLevelOptions,
                                        "\n :: nextLevelConfig = ", nextLevelConfig,
                                    );
                                // nextLevelConfig = [];

                                if ( tempPathTokenConfig ) {
                                    return {
                                        endpoint: token || tempPathTokenConfig?.endpoint,
                                        url: tempLocalPath.join( '/' ) || tempPathTokenConfig?.url,
                                        title: caseCamelToSentence( token ) || tempPathTokenConfig?.title,
                                        label: caseCamelToSentence( token ) || tempPathTokenConfig?.title,
                                        options: sameLevelOptions,
                                    };
                                }
                            }
                        } );

                if ( debug === true )
                    console.log(
                        "NavProvider :: buildBreadcrumbs",
                        "\n :: VALUES :: AFTER GEN :: ",
                        "\n :: tempLocalPath = ", tempLocalPath,
                        "\n :: tempPathTokenConfig = ", tempPathTokenConfig,
                        "\n :: tempRoutesConfig = ", tempRoutesConfig,
                        "\n :: sameLevelOptions = ", sameLevelOptions,
                        "\n :: nextLevelConfig = ", nextLevelConfig,
                    );

                if (
                    tempPathTokenConfig?.hasOwnProperty( 'pages' )
                    && tempPathTokenConfig.pages
                    && Array.isArray( tempPathTokenConfig.pages )
                    && tempPathTokenConfig.pages.length > 0
                ) {
                    nextLevelConfig = tempPathTokenConfig.pages || [];
                }

                if ( Array.isArray( nextLevelOptions ) && nextLevelOptions.length > 0 ) {
                    pathBreadcrumbs.push( {
                        endpoint: '',
                        label: "+",
                        options: nextLevelOptions.map( ( route ) => ( {
                            label: route?.title,
                            value: route?.endpoint,
                            endpoint: route?.endpoint,
                        } ) ),
                    } );
                }
                else if (
                    tempPathTokenConfig
                    && tempPathTokenConfig?.hasOwnProperty( 'pages' )
                    && Array.isArray( tempPathTokenConfig?.pages )
                    && tempPathTokenConfig?.pages.length > 0
                ) {
                    pathBreadcrumbs.push( {
                        endpoint: '',
                        label: "+",
                        options: tempPathTokenConfig?.pages.map( ( route ) => ( {
                            label: route?.title,
                            value: route?.endpoint,
                            endpoint: route?.endpoint,
                        } ) ),
                    } );
                }



                return (
                    <div
                        className={ `dashboard-content-header-breadcrumbs-container fixed flex flex-row max-h-full w-full justify-between items-center p-0 m-0 top-0 shadow-[0px_4px_6px_0px_rgba(0,_0,_0,_0.1)] gap-0 border-none transition-all duration-300 relative h-10 hover:top-0 -top-4 hover:border-b hover:border-sidebar-border z-[22]` }
                        style={ {
                            height: `${ CONTENT_BREADCRUMBS_HEIGHT }rem`,
                        } }>
                        { path && path !== '' && (
                            <Breadcrumbs
                                className={ `justify-start items-center self-center h-auto w-full !hover:flex` }
                                path={ pathBreadcrumbs }
                            /* nextPaths={
                                [ {
                                    endpoint: '',
                                    label: "+",
                                    options: nextLevelOptions.map( ( route ) => ( {
                                        label: route?.title,
                                        value: route?.endpoint,
                                        endpoint: route?.endpoint,
                                    } ) ),
                                } ]
                            } */
                            />
                        ) }
                    </div>
                );
            },
            [ path ]
        );


    const getIdsArray = ( data ) => {
        if ( data && utils.val.isValidArray( data, true ) ) {
            // SYNTAX :: findAll( data = [], matchKey = '', matchValue = '', returnKey = '' )
            return findAll( data, '_id', null, '_id' );
        } else {
            return [];
        }
    };

    const buildNavTree = ( routesConfigOverride ) => {
        // TODO :: Make sure all pages that are turned off in settings are reflected here.
        return (
            <div className='w-full px-2 border rounded-lg'>
                <div className='p-2 border-b flex-row items-center justify-between h-min w-full '>
                    <h3 className='font-semibold'>Site Map</h3>

                    <Button
                        variant={ 'ghost' }
                        size={ 'icon' }
                        className={ `` }
                        onClick={ () => ( setNavTreePinned( !navTreePinned ) ) }
                    >
                        { navTreePinned ? ( <PinOffIcon className={ `size-4 aspect-square flex-shrink-0 stroke-foreground stroke-[0.1rem]` } /> ) : ( <PinIcon className={ `size-4 aspect-square flex-shrink-0 stroke-foreground stroke-[0.1rem]` } /> ) }
                    </Button>

                </div>

                <RecursiveNavigationTree
                    routesConfig={ routesConfigOverride ? routesConfigOverride : routesConfig }
                    onNavigate={ ( url ) => {
                        console.log( 'Navigate to:', url );
                        // Implement your navigation logic here
                        // TODO :: Validate url before proceeding. 
                        if ( url ) navigate( url );
                    } }
                // searchTerm={ navTreeSearchTerm }
                // setSearchTerm={ setNavTreeSearchTerm }
                />
            </div>
        );
    };

    return (
        <NavContext.Provider
            value={ {
                // Values
                pathnames,
                pathname,
                endpoint,
                search,
                hash,
                path,

                // Nav config objects
                routesConfig,
                userNavConfig,
                // settingsNavConfig,

                // Handler functions
                getPath,
                getPathFrom,
                getRelativePath,
                getIdsArray,

                // Component builder functions
                getSubPathsOfEndpoint,
                getSubPathsOfPage,
                getDynamicNextPaths,
                getIdsOfType,
                convertIdsToRoutes,
                getRoutesOfType,
                buildBreadcrumbs,
                getNavButtons,
                getConfigOfEndpoint,
                buildNavTree,

                // Pre-created React-Router-Dom useHook values.
                location,
                navigate,
            } }
            { ...props }>
            { children }
        </NavContext.Provider>
    );
};

// Context-based useHook.
export function useNav () {
    const context = useContext( NavContext );
    if ( !context ) {
        throw new Error( 'useNav must be used within a NavContext.Provider' );
    }
    return context;
}

export default NavProvider;



/* 
    let navConfig = [
        {
            title: 'User Settings',
            endpoint: 'user',
            target: 'user/*',
            url: '/dash/user/profile',
            enabled: false,
            visible: true,
            element: <UserSettingsPage />,
            useSidebar: false,
            sidebarElement: null,
            icon: BoxesIcon,
            showInMiniNav: true,
            location: 'nav-header',
        },
        {
            title: 'Dashboard Landing Page',
            endpoint: '',
            target: '/',
            url: '/dash',
            enabled: true,
            visible: true,
            element: <DashboardHomePage />,
            useSidebar: true,
            sidebarElement: <DashboardLeftSidebar />,
            icon: BoxesIcon,
            showInMiniNav: true,
            location: 'nav-header',
        },
        {
            title: 'Dashboard Home',
            endpoint: 'home',
            target: 'home/*',
            url: '/dash/home',
            enabled: true,
            visible: true,
            element: <DashboardHomePage />,
            useSidebar: true,
            sidebarElement: <DashboardLeftSidebar />,
            icon: BoxesIcon,
            showInMiniNav: true,
            location: 'nav-header',
        },
        {
            title: 'Todo',
            endpoint: 'todo',
            target: 'todo/*',
            url: '/dash/todo/kanban',
            enabled: true,
            visible: true,
            element: <TodoPage />,
            useSidebar: true,
            sidebarElement: <TodoLeftSidebarContent />,
            icon: WorkflowIcon,
            showInMiniNav: true,
            location: 'nav-header',
            badge: getDataLengthSafe( tasksData ),
        },
        {
            title: 'Planner',
            endpoint: 'planner',
            target: 'planner/*',
            url: '/dash/planner/scheduler',
            enabled: true,
            visible: true,
            element: <PlannerPage />,
            useSidebar: true,
            sidebarElement: <PlannerLeftSidebarContent />,
            icon: CalendarIcon,
            showInMiniNav: true,
            location: 'nav-header',
            // TODO :: Make a function in the plannerStore to get all events today, or upcoming in a set range of time.
            // This means moving all those functions from the usePlanner hook to the plannerStore file.
            badge: getDataLengthSafe( eventsData ),
        },
        {
            title: 'Notes',
            endpoint: 'notes',
            target: 'notes/*',
            url: '/dash/notes',
            enabled: true,
            visible: true,
            element: <NotesPage />,
            useSidebar: true,
            sidebarElement: <NotesLeftSidebarContent />,
            icon: Inbox,
            showInMiniNav: true,
            location: 'nav-header',
            badge: getDataLengthSafe( recentNotesData ),
        },
        {
            title: 'Habits',
            endpoint: 'habits',
            target: 'habits/*',
            url: '/dash/habits',
            enabled: true,
            visible: true,
            element: <ReflectPage />,
            useSidebar: true,
            sidebarElement: <ReflectStatsSidebar />,
            icon: HeartPulseIcon,
            showInMiniNav: true,
            location: 'nav-header',
        },
        {
            title: 'Reflect',
            endpoint: 'reflect',
            target: 'reflect/*',
            url: '/dash/reflect',
            enabled: false,
            visible: true,
            element: <ReflectPage />,
            useSidebar: true,
            sidebarElement: <ReflectStatsSidebar />,
            icon: LucideMessageCircleMore,
            showInMiniNav: false,
            location: 'nav-header',
        },
        {
            title: 'Stats',
            endpoint: 'stats',
            target: 'stats/*',
            url: '/dash/stats',
            enabled: true,
            visible: true,
            element: <ReflectPage />,
            useSidebar: true,
            sidebarElement: <ReflectStatsSidebar />,
            icon: GlassesIcon,
            showInMiniNav: true,
            location: 'nav-header',
            badge: utils.val.isValidArray( statsData, true )
                ? getDataLengthSafe( statsData )
                : null,
        },
        {
            title: 'Journal',
            endpoint: 'journal',
            target: 'journal/*',
            url: '/dash/journal',
            enabled: true,
            visible: true,
            element: <JournalPage />,
            useSidebar: true,
            sidebarElement: <PlannerLogRightSidebarContent />,
            icon: BookHeartIcon,
            showInMiniNav: true,
            location: 'nav-header',
            // Show an alert icon if the user has not logged their day today yet.
            badge: logsData?.find( ( log ) =>
                isSameDay( log?.date, new Date( Date.now() ) ) ? '!' : null,
            ),
        },
        {
            title: 'Pomodoro / Time Management',
            endpoint: 'time',
            target: 'time/*',
            url: '/dash/time',
            enabled: true,
            visible: true,
            element: <TimePage />,
            useSidebar: false,
            sidebarElement: null,
            icon: Clock,
            showInMiniNav: true,
            location: 'nav-header',
        },
        {
            title: 'Orion',
            endpoint: 'orion',
            target: 'orion/*',
            url: '/dash/orion',
            enabled: true,
            visible: true,
            element: <AIPage />,
            useSidebar: false,
            sidebarElement: null,
            icon: Sparkles,
            showInMiniNav: true,
            location: 'nav-header',
        },
        {
            title: 'Search',
            endpoint: 'search',
            target: 'search/*',
            url: '/dash/search',
            enabled: false,
            visible: true,
            element: <SearchPage />,
            useSidebar: false,
            sidebarElement: null,
            icon: Search,
            showInMiniNav: false,
            location: 'nav-footer',
        },
        {
            title: 'Workspaces',
            endpoint: 'workspaces',
            target: 'workspaces/*',
            url: '/dash/workspaces',
            enabled: true,
            visible: true,
            element: <WorkspacesPage />,
            useSidebar: true,
            sidebarElement: <WorkspacesLeftSidebarContent />,
            icon: Blocks,
            showInMiniNav: true,
            location: 'nav-footer',
            badge: getDataLengthSafe( workspacesData ),
        },
        {
            title: 'Messages',
            endpoint: 'messages',
            target: 'messages/*',
            url: '/dash/messages',
            enabled: true,
            visible: true,
            element: <RemindersPage defaultEndpoint={ null } />,
            useSidebar: true,
            sidebarElement: <ReminderLeftSidebar />,
            icon: AlertCircleIcon,
            showInMiniNav: true,
            location: 'nav-footer',
            badge: utils.val.isValidArray( remindersData, true )
                ? getDataLengthSafe( remindersData )
                : null,
        },
        {
            title: 'Notifications',
            endpoint: 'notifications',
            target: 'notifications/*',
            url: '/dash/notifications',
            enabled: false,
            visible: true,
            element: <RemindersPage defaultEndpoint={ 'notifications' } />,
            useSidebar: true,
            sidebarElement: <ReminderLeftSidebar />,
            icon: BellRing,
            showInMiniNav: false,
            location: 'nav-footer',
            badge:
                utils.val.isValidArray( notificationsData, true ) &&
                    utils.val.isValidArray( remindersData, true )
                    ? `${ getDataLengthSafe(
                        notificationsData,
                    ) } / ${ getDataLengthSafe( remindersData ) }`
                    : null,
        },
        {
            title: 'Trash',
            endpoint: 'trash',
            target: 'trash/*',
            url: '/dash/trash',
            enabled: true,
            visible: true,
            element: <TrashPage />,
            useSidebar: false,
            sidebarElement: null,
            icon: Trash2,
            showInMiniNav: false,
            location: 'nav-footer',
            badge: getTrash(),
        },
        {
            title: 'Settings',
            endpoint: 'settings',
            target: 'settings/*',
            url: '/dash/settings',
            enabled: true,
            visible: true,
            element: <SettingsPage />,
            useSidebar: false,
            sidebarElement: null,
            icon: Settings2,
            showInMiniNav: true,
            location: 'nav-footer',
        },
        {
            title: 'Help',
            endpoint: 'help',
            target: 'help/*',
            url: '/dash/help',
            enabled: true,
            visible: true,
            element: <HelpDropdown />,
            useSidebar: false,
            sidebarElement: (
                <>{ `Put a list of help topics here; clicking on one sends the user to a subpage endpoint.` }</>
            ),
            icon: MessageCircleQuestion,
            showInMiniNav: false,
            location: 'nav-footer',
        },
    ];
*/


