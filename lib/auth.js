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
            admin = 'none';
        if(this.isOwner(req, res)) {
            login = 'none';
            logout = 'inline';
            users = req.user.ID;
            if(users == "root"){
                admin = 'inline';
            }else{
                admin = 'none';
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