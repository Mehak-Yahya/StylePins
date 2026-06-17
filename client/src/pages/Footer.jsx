import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Left */}
        <div className="footer-brand">
          <h1>StylePins</h1>
          <p>© 2026 StylePins</p>
        </div>

        {/* Column 1 */}
        <div className="footer-column">
          <h3>Get the app</h3>
          <a href="/">iOS</a>
          <a href="/">Android</a>
        </div>

        {/* Column 2 */}
        <div className="footer-column">
          <h3>Quick links</h3>
          <a href="/">Explore</a>
          <a href="/">Shop</a>
          <a href="/">Users</a>
          <a href="/">Collections</a>
          <a href="/">Shopping</a>
          <a href="/">Help Center</a>
        </div>

        {/* Column 3 */}
        <div className="footer-column">
          <h3>Policies</h3>
          <a href="/">Terms of service</a>
          <a href="/">Privacy policy</a>
          <a href="/">Non-user notice</a>
        </div>

      </div>
    </footer>
  );
}