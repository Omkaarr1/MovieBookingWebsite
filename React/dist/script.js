function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}let text = `
Thankyou For Using Our Website.         
Hope you'll visit us soon!`;

// Cycle animation
const fadeInOut = true;
// Time to complete animation. Proportional to framerate
const animationDuration = 4000;
// Time it takes each letter to fade in. Inversely proportional to framerate
const animationSpeed = 1000;
const fontSize = 50;

// Keep synced with scss
const numKeyframes = 20;

// Alternate Setup

// let text = `
// Wo ein treues Herze
// In Liebe vergeht,
// Da welken die Lilien
// Auf jedem Beet;
// Da muß in die Wolken
// Der Vollmond gehn,
// Damit seine Tränen
// Die Menschen nicht sehn;
// Da halten die Englein
// Die Augen sich zu
// Und schluchzen und singen
// Die Seele zur Ruh.`

// const fadeInOut = true;
// const animationDuration = 8000
// const animationSpeed = 800
// const fontSize = 34
// const numKeyframes = 20


// ---------------------------------------------------------------
text = text.replace(/\n/i, '');
const p = PropTypes;

class Letter extends React.Component {














  constructor() {
    super();
    this.state = {
      show: false,
      animate: true };

    this.timeouts = [];
  }

  componentDidMount() {
    if (this.props.animate === 'in') {
      this._fadeIn();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.animate !== this.props.animate) {
      if (nextProps.animate === 'in') {
        this._fadeIn();
      } else {
        this._fadeOut();
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextState.fade !== this.state.fade ||
      nextState.show !== this.state.show ||
      nextProps.x !== this.props.x ||
      nextProps.y !== this.props.y ||
      nextProps.fontHeight !== this.props.fontHeight);

  }

  componentWillUnmount() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
  }

  // render component and animate in
  _fadeIn() {
    this.timeouts.push(setTimeout(() => {
      this.setState({
        fade: 'in',
        show: true });

      // Disable animation after fade in
      this.timeouts.push(setTimeout(() => this.setState({ animate: false }), this.animationSpeed));
    }, this.props.animationStart + Math.random() * this.props.animationSpeed));
  }

  // animate out then stop rendering
  _fadeOut() {
    this.timeouts.push(setTimeout(() => {
      this.setState({ fade: 'out', animate: true });
      this.timeouts.push(setTimeout(() => {
        this.setState({ show: false });
      }, this.props.animationSpeed));
    }, this.props.animationStart + Math.random() * this.props.animationSpeed));
  }

  render() {
    if (!this.state.show) {
      return null;
    }
    const keyframe = Math.floor(Math.random() * this.props.numKeyframes + 1);
    const easingFunction = `cubic-bezier(${Math.random() * .8 + +.1},0,${Math.random() * .5 + .25},1)`;
    const proportionalPosition = this.props.i / this.props.textLen;
    const transitionDelay = proportionalPosition / 2 +
    Math.random() * proportionalPosition;
    return /*#__PURE__*/(
      React.createElement("div", {
        className: "letter",
        style: {
          fontSize: this.props.fontHeight,
          height: this.props.fontHeight,
          width: this.props.fontHeight / 2,
          left: this.props.x,
          top: this.props.y,
          transition: `
            top 1s ${easingFunction} ${transitionDelay}s,
            left 1s ${easingFunction} ${transitionDelay}s,
            font-size 1s ${easingFunction} ${transitionDelay}s
          `,
          animation: this.state.animate ?
          `
              ${'fade-' + this.state.fade + '-' + keyframe}
              ${easingFunction}
              ${this.props.animationSpeed}ms forwards
            ` :
          null } },

      this.props.char));

  }}_defineProperty(Letter, "propTypes", { x: p.number.isRequired, y: p.number.isRequired, i: p.number.isRequired, textLen: p.number.isRequired, char: p.string.isRequired, fontHeight: p.number.isRequired, numKeyframes: p.number.isRequired, animate: p.oneOf(['in', 'out']), animationSpeed: p.number.isRequired, animationStart: p.number.isRequired });


class RandomText extends React.Component {















  constructor() {
    super();
    this.state = {
      numRows: null,
      chars: null,
      updated: false };

  }

  componentDidMount() {
    this.setState(this._mapCharPositions(this.props));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.fontHeight !== this.props.fontHeight || nextProps.width !== this.props.width) {
      this.setState(this._mapCharPositions(nextProps));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.updated) {
      this.setState({ updated: false });
      return true;
    }
    return (
      nextProps.animate !== this.props.animate ||
      this.state.chars === null);

  }

  // returns an array of chars w/ form [x, y, char]
  _mapCharPositions(props) {
    const fontWidth = props.fontHeight / 2;
    const charsPerRow = Math.floor(props.width / fontWidth);
    const emptySpaceInRow = props.width - charsPerRow * fontWidth;
    const margin = emptySpaceInRow / (charsPerRow + 1);
    const chars = [];
    let text = props.text.trim();
    let textLength = text.length;

    let firstLetterOfWord = true;
    for (let i = 0; i < textLength; i++) {
      const col = i % charsPerRow;

      // Don't push spaces into the array, and if there is a space at the
      // beginning of a line, remove it from the original text and put the next
      // character in its place
      if (text[i] === ' ') {
        firstLetterOfWord = true;
        if (col === 0) {
          text = text.slice(0, i) + text.slice(i + 1);
          i--;
          textLength--;
        }
      } else {
        // Handle text wrapping
        if (firstLetterOfWord) {
          let wordLength = 1;
          let wordCounter = 1;
          while (i + wordCounter < text.length && text[i + wordCounter] !== ' ') {
            wordLength++;
            wordCounter++;
          }
          firstLetterOfWord = false;

          const charsLeftInRow = charsPerRow - col;
          const indOfLastCharInRow = i + charsLeftInRow;
          // If the word is too long to fit on one line hyphenate it
          if (wordLength > charsPerRow) {
            text = text.slice(0, indOfLastCharInRow - 1) + '-' + text.slice(indOfLastCharInRow - 1);
            textLength++;
          }
          // Else insert spaces and adjust textLength to skip the word to the next line
          else if (wordLength > charsLeftInRow) {
              text = text.slice(0, i) + ' '.repeat(wordLength) + text.slice(i);
              textLength += wordLength;
            }
        }
        // Push the char at i into the return arr
        chars.push([
        col * fontWidth + margin * (col + 1), // x
        Math.floor(i / charsPerRow) * props.fontHeight, // y
        text[i]]);

      }
    }
    const numRows = Math.ceil(textLength / charsPerRow);
    return { numRows, chars, updated: true };
  }

  render() {
    if (this.state.chars == null) {
      return null;
    } else {
      return /*#__PURE__*/(
        React.createElement("div", {
          className: 'container' + ' ' + this.props.className,
          style: {
            height: this.state.numRows * this.props.fontHeight,
            width: this.props.width } },

        this.state.chars.map((char, i) => {
          return /*#__PURE__*/(
            React.createElement(Letter, {
              x: char[0],
              y: char[1],
              char: char[2],
              fontHeight: this.props.fontHeight,
              numKeyframes: numKeyframes,
              key: i,
              i: i,
              textLen: this.props.text.length,
              animate: this.props.animate,
              animationSpeed: this.props.animationSpeed,
              animationStart:
              (this.props.animationDuration - this.props.animationSpeed) /
              this.state.chars.length * i }));


        })));


    }
  }}_defineProperty(RandomText, "propTypes", { text: p.string.isRequired, className: p.string, width: p.number.isRequired, // Sets font-size
  fontHeight: p.number.isRequired, // Duration of each letter's fade in animation
  animationSpeed: p.number.isRequired, // Total animation duration (not counting randomness factor)
  animationDuration: p.number.isRequired, animate: p.oneOf(['in', 'out']), homePage: p.bool });class App extends React.Component {

  constructor() {
    super();
    this.state = {
      animate: 'in',
      width: document.body.offsetWidth * .6 };

    if (fadeInOut) {
      setInterval(() => {
        this.setState({ animate: this.state.animate == 'in' ? 'out' : 'in' });
      }, animationDuration + 5000);
    }
  }

  componentWillMount() {
    this._setupResizeListener();
  }

  render() {
    return /*#__PURE__*/(
      React.createElement(RandomText, {
        width: this.state.width,
        text: text,
        fontHeight: fontSize,
        animate: this.state.animate,
        animationDuration: animationDuration,
        animationSpeed: animationSpeed }));

  }

  _getWindowWidth() {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  }

  _setupResizeListener() {
    // Create "window.throttledResize" event that listens to resize and throttles it to fire once per frame at most
    // https://developer.mozilla.org/en-US/docs/Web/Events/resize#requestAnimationFrame_customEvent
    let running = false;
    const throttleResize = () => {
      if (!running) {
        running = true;
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent('throttledResize'));
          running = false;
        });
      }
    };
    window.addEventListener('resize', throttleResize);
    window.addEventListener('throttledResize', this._handleResize.bind(this));
  }

  _handleResize() {
    const width = this._getWindowWidth();
    if (Math.abs(width * .6 - this.state.width) > 100) {
      this.setState({ width: width * .6 });
    }
  }}



ReactDOM.render( /*#__PURE__*/
React.createElement(App, null),
document.getElementById('app'));