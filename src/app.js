import './assets/scss/app.scss';
import $ from 'cash-dom';
import es6Promise from 'es6-promise';
es6Promise.polyfill()
import 'isomorphic-fetch';
import 'babel-polyfill';
import moment from 'moment';

const EVENT_PULL_REQUEST = 'PullRequestEvent';
const EVENT_PULL_REQUEST_COMMENT = 'PullRequestReviewCommentEvent';

export class App {
  initializeApp() {
    $('.load-username').on('click', this.fetchUserInfo.bind(this));
  }

  fetchUserInfo (e) {
    const userInput = $('.username.input');
    const userName = userInput.val();

    userInput.removeClass('has-error');

    if (!this.validate(userInput)) {
      userInput.addClass('has-error');
      return;
    }

    this.fetchUserProfile(userName);
    this.fetchUserEvents(userName);
  }

  async fetchUserProfile (userName) {
    const response = await fetch(`https://api.github.com/users/${userName}`);
    const body = await response.json();
    this.updateProfile(body);
  }

  async fetchUserEvents (userName) {
    const response = await fetch(`https://api.github.com/users/${userName}/events/public`);
    const body = await response.json();

    let events = '';

    for (const event of body) {
      switch (event.type) {
        case EVENT_PULL_REQUEST: {
          events += this.getPullRequestItem(event);
          break;
        }
        case EVENT_PULL_REQUEST_COMMENT: {
          events += this.getPullRequestCommentItem(event);
          break;

        }
        default:
          continue;
      }
    }

    $('#user-timeline').html(events);
  }

  getPullRequestItem (event) {
    const { actor: { avatar_url: avatar, display_login: login, url }, repo: { name: repoName }, created_at: createdAt, payload: { action, pull_request: pullRequest } } = event;
    const { url: pullRequestUrl } = pullRequest;

    if (!['opened', 'closed'].includes(action)) {
      return '';
    }

    const template = $('#template-pull-request');

    const formatedCreatedAt = moment(createdAt).format('ll');

    $(template).find('.gh-username a').html(login).attr('href', url);
    $(template).find('.gh-username img').attr('src', avatar);
    $(template).find('.pull-request-link').attr('href', pullRequestUrl);
    $(template).find('.repo-name a').html(repoName).attr('href', `https://github.com/${repoName}`);
    $(template).find('.heading').html(formatedCreatedAt);
    $(template).find('.request-action').html(action);

    return template.html();
  }

  getPullRequestCommentItem (event) {
    const { actor: { avatar_url: avatar, display_login: login, url }, repo: { name: repoName }, created_at: createdAt, payload: { comment, pull_request: pullRequest } } = event;
    const { url: commentUrl } = comment;
    const { url: pullRequestUrl } = pullRequest;

    const template = $('#template-pull-request-comment');

    const formatedCreatedAt = moment(createdAt).format('ll');

    $(template).find('.gh-username a').html(login).attr('href', url);
    $(template).find('.gh-username img').attr('src', avatar);
    $(template).find('.pull-request-link').attr('href', pullRequestUrl);
    $(template).find('.repo-name a').html(repoName).attr('href', `https://github.com/${repoName}`);
    $(template).find('.heading').html(formatedCreatedAt);
    $(template).find('.pull-request-comment-link').attr('href', commentUrl);

    return template.html();
  }

  validate (input) {
    const value = input.val();

    if (value.trim() === '') {
      return false;
    }

    const regex = /[^a-z0-9\-\_]/;

    return !regex.test(value);
  }

  updateProfile({ avatar_url, login, html_url, bio }) {
    $('#profile-name').text($('.username.input').val());
    $('#profile-image').attr('src', avatar_url);
    $('#profile-url').attr('href', html_url).text(login);
    $('#profile-bio').text(bio || '(no information)');
  }
}
