import { createRoot } from "react-dom/client";

// Clear the existing HTML content
document.body.innerHTML = '<header id="header"></header>';

// Render your React component instead
const header = createRoot(document.getElementById("header"));
header.render(<h1>Hello, world</h1>);