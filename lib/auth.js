module.exports = {
    isOwner:function(req, res) {
        if(req.user){
            return true;
        } else {
            return false;
        }
    },

    statusUI:function(req, res){
        var login = 'inline';
            logout = 'none';
            users = null;
            admin = ['none', 'null', 'null', 'null', 'null', 'null'];
        if(this.isOwner(req, res)) {
            login = 'none';
            logout = 'inline';
            users = req.user.ID;
            if(users == "root"){
                admin = ['inline', 'request_list?currentpage=1', 'register_list?currentpage=1', 'new_anncmnt', '/edit_anncmnt?id=', '/delete-anncmnt/'];
            }else{
                admin = ['none', 'null', 'null', 'null', 'null', 'null'];
            }
        }
        return {login, logout, users, admin};
    },

    validation:function(req, res){
        if(this.isOwner(req, res)) {
            return true;
        }else {
            return false;
        }
    }
}