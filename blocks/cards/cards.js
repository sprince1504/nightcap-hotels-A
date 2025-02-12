import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
function Hello(props) {
  return /*#__PURE__*/React.createElement("div", null, "Some text ", props.some);
}
function App() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", null, "Hello, world!"), /*#__PURE__*/React.createElement(Counter, null));
}
function Counter() {
  const [count, setCount] = React.useState(0);
  return /*#__PURE__*/React.createElement("button", {
    onClick: () => setCount(count + 1)
  }, "You clicked me ", count, " times");
}
export default function decorate(block) {
  console.log('card', block);
  console.log('card', block);
  const root = ReactDOM.createRoot(block);
  root.render(/*#__PURE__*/React.createElement(App, null));

  /* change to ul, li */
  // const ul = document.createElement("ul");
  // [...block.children].forEach((row) => {
  // console.log(row);
  // const li = document.createElement("li");
  // moveInstrumentation(row, li);
  // while (row.firstElementChild) li.append(row.firstElementChild);
  // [...li.children].forEach((div) => {
  //   if (div.children.length === 1 && div.querySelector("picture"))
  //     div.className = "cards-card-image";
  //   else div.className = "cards-card-body";
  // });
  // ul.append(li);
  // });
  // ul.querySelectorAll("picture > img").forEach((img) => {
  //   const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [
  //     { width: "750" },
  //   ]);
  //   moveInstrumentation(img, optimizedPic.querySelector("img"));
  //   img.closest("picture").replaceWith(optimizedPic);
  // });
  // block.textContent = "";
  // block.append(ul);
}