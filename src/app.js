import './assets/scss/app.scss';
import $ from 'cash-dom';
import es6Promise from 'es6-promise';
es6Promise.polyfill()
import 'isomorphic-fetch';
import 'babel-polyfill';

export class App {
  initializeApp() {
    $('.load-username').on('click', this.fetchUserProfile.bind(this))
  }

  async fetchUserProfile(e) {
    const userInput = $('.username.input');
    const userName = userInput.val();

    userInput.removeClass('has-error');

    if (!this.validate(userInput)) {
      userInput.addClass('has-error');
      return;
    }

    const response = await fetch(`https://api.github.com/users/${userName}`)
    const body = await response.json()
    this.updateProfile(body)
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
    $('#profile-name').text($('.username.input').val())
    $('#profile-image').attr('src', avatar_url)
    $('#profile-url').attr('href', html_url).text(login)
    $('#profile-bio').text(bio || '(no information)')
  }
}