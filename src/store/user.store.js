// import { doc, getDoc } from "firebase/firestore";
// import { db } from "./firebase";
import { create } from "zustand";

/*  Constructing Utility Functions
    Utility functions can also be used to simplify the state update and make code readability much easier.Below, take a look at an example with an updated nested state:

    const updateNestedState = ( set, keyPath, value ) => {
        set( ( state ) => {
            const keys = keyPath.split( "." );
            let nestedState = state;
            keys.slice( 0, -1 ).forEach( ( key ) => {
                nestedState = nestedState[ key ];
            } );
            nestedState[ keys[ keys.length - 1 ] ] = value;
            return { ...state };
        } );
    };

    const useNestedStateStore = create( ( set ) => ( {
        data: {
            user: {
                profile: {
                    name: "",
                },
            },
        },
        updateProfileName: ( name ) =>
            updateNestedState( set, "data.user.profile.name", name ),
    } ) );
*/

export const useUserStore = create( ( set, get, api ) => ( {
    currentUser: null,
    isLoading: true,

    user: null,
    setUser: ( user ) => set( () => ( { user } ) ),

    userLoggedIn: null,
    setUserLoggedIn: ( userLoggedIn ) => set( () => ( { userLoggedIn } ) ),

    getUserToken: () => {
        return GetLocal( [ 'mindspace', 'app', 'user', 'token' ].join( '_' ) );
    },

    userToken: null,
    setUserToken: ( userToken ) => set( () => ( { userToken } ) ),

} ) );

/*  // Custom hooks 
    import { create } from "zustand";

    const useAuthStore = create((set) => ({
      user: null,
      login: (userData) => set({ user: userData }),
      logout: () => set({ user: null }),
    }));

    const useAuth = () => {
      const { user, login, logout } = useAuthStore();
      return { user, login, logout };
    };

    export default useAuth;
*/

/*  const useStore = create( ( set ) => ( {
        user: {
            name: "",
            age: 0,
            address: {
                street: "",
                city: "",
            },
        },
        updateUser: ( newUser ) =>
            set( ( state ) => ( { user: { ...state.user, ...newUser } } ) ),
        updateAddress: ( newAddress ) =>
            set( ( state ) => ( {
                user: {
                    ...state.user,
                    address: { ...state.user.address, ...newAddress },
                },
            } ) ),
    } ) );
*/

/*  export const useUserStore = create( ( set ) => ( {
        currentUser: null,
        isLoading: true,
        fetchUserInfo: async ( uid ) => {
            if ( !uid ) return set( { currentUser: null, isLoading: false } );

            try {
                const docRef = doc( db, "users", uid );
                const docSnap = await getDoc( docRef );

                if ( docSnap.exists() ) {
                    set( { currentUser: docSnap.data(), isLoading: false } );
                } else {
                    set( { currentUser: null, isLoading: false } );
                }
            } catch ( err ) {
                console.log( err );
                return set( { currentUser: null, isLoading: false } );
            }
        },
    } ) );
*/