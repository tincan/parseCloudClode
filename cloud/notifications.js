var mentioner, mentionee, blurb;

exports.notify = function(request, response) {
  if (request.object.get("type") == "mention") {
    /*
    getNotificationForRequest(request).then(function(result){
      if (!result) {
        return getActivity(request);
      } else {
        return;
      }
    }).then(function(activity) {
      pushMention(activity);
    });
    */
  }

  if (request.object.get("type") == "follow") {
    /*
    getNotificationForRequest(request).then(function(count){
      if (!count) {
        return getActivity(request);
      } else {
        return;
      }
    }).then(function(activity) {
      pushFollow(activity);
    });
    */
  }

  if (request.object.get("type") == "like") {
    haveSentNotificationForRequest(request).then(function(haveNotified){
      if (!haveNotified) {
        getActivity(request).then(function(activity){
          pushLike(activity);
        });
      }
    });
  }
}

function getActivity(request) {

  var promise = new Parse.Promise();
  var Activity = Parse.Object.extend("Activity");

  var query = new Parse.Query(Activity);
  query.include("fromUser");
  query.include("toUser");
  (request.object.get("type") == "like") ? query.include("blurb") : null;

  query.get(request.object.id).then(function(activity){
    promise.resolve(activity);
  });
  return promise;

}

function haveSentNotificationForRequest(request) {

  var promise = new Parse.Promise();
  var Notification = Parse.Object.extend("Notification");

  var query = new Parse.Query(Notification);
  query.equalTo("fromUser", request.object.get("fromUser"));
  query.equalTo("toUser", request.object.get("toUser"));
  query.equalTo("type", request.object.get("type"));
  query.equalTo("blurb", request.object.get("blurb"));

  query.count({
    success: function(count) {
      haveNotified;
      if (count > 0) {
        haveNotified = true;
      } else {
        haveNotified = false;
      }
      promise.resolve(haveNotified);
    },
    error: function(error) {
      return Parse.Promise.error("There was an error counting the number of Notifications matching the query");
    }
  });
}

function pushFollow(activity, response) {

  follower = activity.get("fromUser");
  followee = activity.get("toUser");

  var message = "@" + follower.get("username") + " started following you."

  var query = new Parse.Query(Parse.Installation);
  query.equalTo('user', followee);

  Parse.Push.send({
    where: query,
    data: {
      alert: message,
      badge: "Increment",
      sound: "push-notification.aiff"
    }
  }, {
    success: function() {
      recordNotificationForActivity(activity);
    },
    error: function(error) {
      console.log("there was an error sending the push: " + error.code + " " + error.message);
    }
  });
}


function pushLike(activity, response) {

  liker = activity.get("fromUser");
  likee = activity.get("toUser");
  blurb = activity.get("blurb");

  var message = "@" + liker.get("username") + " liked your blurb, " + blurb.get("title");

  var query = new Parse.Query(Parse.Installation);
  query.equalTo("user", likee);

  Parse.Push.send({
    where: query,
    data: {
      alert: message,
      badge: "Increment",
      sound: "push-notification.aiff"
    }
  }, {
    success: function() {
      recordNotificationForActivity(activity);
    },
    error: function(error) {
      console.log("there was an error sending the push: " + error.code + " " + error.message);
    }
  });
}

function pushMention(activity, response) {

  mentioner = activity.get("fromUser");
  mentionee = activity.get("toUser");

  var message = "@" + mentioner.get("username") + " mentioned you in a blurb."

  var query = new Parse.Query(Parse.Installation);
  query.equalTo('user', mentionee);

  Parse.Push.send({
    where: query,
    data: {
      alert: message,
      badge: "Increment",
      sound: "push-notification.aiff"
    }
  }, {
    success: function() {
      recordNotificationForActivity(activity);
    },
    error: function(error) {
      console.log("there was an error sending the push: " + error.code + " " + error.message);
    }
  });
}

function recordNotificationForActivity(activity) {
  var Notification = Parse.Object.extend("Notification");
  var notification = new Notification();
  notification.set("type", activity.get("type"));
  notification.set("fromUser", activity.get("fromUser"));
  notification.set("toUser", activity.get("toUser"));
  notification.set("blurb", activity.get("blurb"));
  notification.save(null, {
    success: function(activity) {
      console.log("Notification has been created with objectId: " + notification.id);
    },
    error: function(activity, error) {
      console.log("Failed to create new activity, with error: " + error.message);
    }
  });
}
