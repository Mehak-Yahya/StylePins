import "../styles/hero.css";

const Hero = () => {
  return (
    <section className="hero">

      <div className="hero-left">
        <h1>Create the life you love on Pinterest</h1>

        <div className="hero-buttons">
          <button className="primary-btn">
            Join Pinterest for free
          </button>

          <button className="secondary-btn">
            I already have an account
          </button>
        </div>
      </div>

      <div className="hero-right">

        {/* Top Left */}
        <img
          className="floating top-left"
          src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800"
          alt=""
        />

        {/* Top Right Leaf */}
<img
  className="floating top-right-leaf"
  src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800"
  alt=""
/>

        {/* Center Main */}
        <img
          className="floating center"
          src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800"
          alt=""
        />

        {/* Top Right */}
        <img
          className="floating top-right"
          src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800"
          alt=""
        />

        {/* Bottom Left */}
        <img
          className="floating bottom-left"
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800"
          alt=""
        />

        {/* Bottom Right */}
        <img
          className="floating bottom-right"
          src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800"
          alt=""
        />

      </div>

    </section>
  );
};

export default Hero;