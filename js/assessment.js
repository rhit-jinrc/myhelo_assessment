/**
 * Namespace.
 *
 * @type {Object}
 */
var assessment = {};

/**
 * Send an API call to the FDA and execute a callback with the results.
 *
 * @param {string} url The API endpoint to call
 * @param {Function} callback Function to call upon successful execution of
 * the API call.
 */
assessment.fda_api = function(url, callback) {
  const callback_ = function() {
    const json = JSON.parse(this.responseText);
    callback(json.results);
  };

  const request = new XMLHttpRequest();
  request.addEventListener('load', callback_);
  request.open('GET', url);
  request.send();
};

/**
 * Send an API call to OpenAI and execute a callback with the results.
 * 
 * @link https://platform.openai.com/docs/guides/completions#page-top
 *
 * @param {Array} messages The messages to send to OpenAI.
 * @param {Function} callback Function to call upon successful execution of
 * the API call.
 */
assessment.openai_api = function(messages, callback) {
  const callback_ = function() {
    if (this.status !== 200) {
      console.error('OpenAI Proxy Error: ' + this.responseText);
      return;
    }
    const json = JSON.parse(this.responseText);
    // The proxy returns the full OpenAI response
    callback(json.choices[0].message.content);
  };

  const request = new XMLHttpRequest();
  request.addEventListener('load', callback_);
  request.open('POST', 'http://localhost:3000/api/openai');
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(JSON.stringify({
    model: 'gpt-4o',
    messages: messages
  }));
};

/**
 * Runs when the document is fully loaded and ready to go.
 */
assessment.ready = function() {
  const header = new component.header();
  header.render(document.body);

  const visualization = new component.visualization();
  visualization.render(document.body);
};

/**
 * Extends one class with another.
 *
 * @link https://oli.me.uk/2013/06/01/prototypical-inheritance-done-right/
 *
 * @param {Function} destination The class that should be inheriting things.
 * @param {Function} source The parent class that should be inherited from.
 *
 * @return {Object} The prototype of the parent.
 */
assessment.extend = function(destination, source) {
  destination.prototype = Object.create(source.prototype);
  destination.prototype.constructor = destination;

  return source.prototype;
};
