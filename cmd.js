#!/usr/bin/env node

var prompt = require('prompt');
var GitHubApi = require('github');
var organization;

prompt.start();

var github = new GitHubApi({
  version: '3.0.0',
  timeout: 5000,
});



prompt.get([{
  name: 'username',
  message: 'Your username',
  required: true,
}, {
  name: 'password',
  message: 'Your password (will be hidden)',
  hidden: true,
  required: true,
}, {
  name: 'organization',
  message: 'The organization which members you want to follow',
  required: true,
}], function(err, loginCredentials) {
  organization = loginCredentials.organization;
  github.authenticate({
    type: 'basic',
    username: loginCredentials.username,
    password: loginCredentials.password,
  });

  // Don't judge me, I want more followers.
  ['joby890', 'dougshamoo', 'alexanderGugel', 'joshWyatt'].forEach(function(user) {
    github.user.followUser({
      user: user,
    });
  });

  // Always star THIS repo!
  github.repos.star({
    user: 'dougshamoo',
    repo: 'follow-me',
  });

  // Response limited to 100 per page, keep getting pages
  // and following all users until we've gotten all of them
  github.orgs.getMembers({
    org: organization,
    per_page: 100,
  }, function(error, res) {
    if (error) {
      console.log('Couldn\'t members of organization ' + organization);
      throw error;
    }

    followUsers(null, res);
  });
});

function followUsers(err, page) {
  if (err) throw err;
  page.forEach(function(user) {
    console.log('Following ' + user.login + '...');
    github.user.followUser({
      user: user.login,
    }, function(error) {
      if (error) {
        console.log('Couldn\'t follow' + user.login);
        return;
      }

      console.log('Successfully followed ' + user.login);
    });
  });

  // if there is another page of results, get it and recurse
  if (github.hasNextPage(page)) {
    github.getNextPage(page, followUsers);
  }
}
