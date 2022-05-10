const {db} = require('../firebase');

module.exports = {
    checkedId : async function () {
        var id = 0;
        console.log("제발 여기 드르와"+toID);

        await db
      .collection("USER_allow")
      .where("ID", "==", toID)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          id = doc.id;
          console.log("여기 들어오냐?");
        });
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
        
      console.log("id 값을 어떨까? "+id);
        if(id == 0){
            console.log("여기는 중복 X");
            return true;
        } else {
            console.log("여기는 중복 O");
            return false;
        }
    }
};