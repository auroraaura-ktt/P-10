export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* LEFT */}
        <div className="footer-col">
          <h2>
            Miit<span>Verse</span>
          </h2>
          <p>Official Social Hub of MIIT</p>
        </div>

        {/* MIDDLE */}
        <div className="footer-col">
          <h3>Quick Links</h3>
          <a href="/">Home</a>
          <a href="/feed">Feed</a>
          <a href="/news">News</a>
          <a href="/events">Events</a>
        </div>

        {/* RIGHT */}
        <div className="footer-col">
          <h3>Connect</h3>
          <p>📧 miitverse@miit.edu.mm</p>
          <p>📍 MIIT Campus</p>

          <div className="socials">
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
            <a href="#">GitHub</a>
          </div>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} MiitVerse. Built for MIIT Students 🚀
      </div>
    </footer>
  );
}