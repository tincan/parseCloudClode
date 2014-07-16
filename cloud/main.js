/*
 -------------------------- @Twilio ----------------------------------
*/

var twilio = require('cloud/twilio.js');

Parse.Cloud.define("demoSMS", function(request, response) {
  twilio.demoSMS(request, response);
});

/*
 -------------------------- @Mentions --------------------------------
*/

// Extract the user mentions
Parse.Cloud.define("extractMentions", function(request, response) {

    var blurbText = request.params.blurbText;
    var users = blurbText.match(/@\w+/g);
    var realUsers = 0;

    function queryComplete(){
        response.success(realUsers);
    }

    for (userIndex = 0; userIndex < users.length; userIndex++){
        users[userIndex] = users[userIndex].substr(1);

        var mentioned = Parse.Object.extend("User");
      var query = new Parse.Query(mentioned);
      query.equalTo("username",users[userIndex]);
      query.find({
        success: function(results){
         // Notify this user of the mention
             realUsers++;
        },
        error: function(error) {
         // This mention doesn't correspond to a username
        }
      });

        if(userIndex == users.length-1){
            queryComplete();
        }

    }

});
