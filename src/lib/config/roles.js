const ROLE_GUEST = "guest";
const ROLE_USER = "user";
const ROLE_ADMIN = "admin";
const ROLE_SUPER = "superadmin";


export const userRoles = [
    {
        role: ROLE_GUEST,
        permissions: [],
    }, 
    {
        role: ROLE_USER,
        permissions: [],
    }, 
    {
        role: ROLE_ADMIN,
        permissions: [],
    }, 
    {
        role: ROLE_SUPER,
        permissions: [],
    }];

const accessForRoles = {
    // Mskr specific pages only accessable by priveleged users.
    "route.admin": ["admin"],
    "route.authenticated": ["user", "admin"],
    "route.home": ["*"], //means "Any role"
    // Mskr specific components only viewable by priveleged users.
    "component.Admin": ["*", "!user", "!admin"], //Any role except user and admin
    "component.AMA.Post": ["user", "admin"],
    "component.AMA.Reply": ["admin"],
    "component.Blog.Post": ["admin"],
    "component.Blog.Reply": ["user", "admin"],
    "component.Login": ["*"],
    "component.Register": ["*"],
    "component.Profile": ["!guest", "user", "admin", "superadmin"],
};
let postTypes = [
    ""
];
let categoryTypes = [
    ""
];