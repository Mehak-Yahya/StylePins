import "../styles/hero.css";
import Footer from "./Footer";
import Masonry from "react-masonry-css";

const Hero = ({ openSignup, openLogin }) => {
  return (
    <>
      <section className="hero">
        <div className="hero-left">
          <h1>Create the life you love on StylePins</h1>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={openSignup}>
              Join StylePins for free
            </button>

            <button className="secondary-btn" onClick={openLogin}>
              I already have an account
            </button>
          </div>
        </div>

        <div className="hero-right">
          <img
            className="floating top-left"
            src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800"
            alt=""
          />

          <img
            className="floating top-right-leaf"
            src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800"
            alt=""
          />

          <img
            className="floating center"
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800"
            alt=""
          />

          <img
            className="floating top-right"
            src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800"
            alt=""
          />

          <img
            className="floating bottom-left"
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800"
            alt=""
          />

          <img
            className="floating bottom-right"
            src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800"
            alt=""
          />
        </div>
      </section>

      {/* another section */}

      <section className="soccer-section">
        <div className="soccer-left">
          <h2>Step into soccer season</h2>
          <p>Flex your fandom and score fresh inspiration for every match.</p>
        </div>

        <div className="soccer-layout">
          <div className="left-column">
            <img
              className="small-img"
              src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500"
              alt=""
            />

            <img
              className="medium-img"
              src="https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=500"
              alt=""
            />
          </div>

          <div className="center-column">
            <img
              className="big-img"
              src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800"
              alt=""
            />

            <img
              className="second-big-img"
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800"
              alt=""
            />
          </div>

          <div className="right-column">
            <img
              className="medium-img"
              src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500"
              alt=""
            />

            <img
              className="small-img"
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800"
              alt=""
            />
          </div>
        </div>
      </section>
      <section className="winning-ideas">
        <div className="winning-header">
          <h2>More winning ideas</h2>

          <button className="see-all">See all</button>
        </div>

        <div className="winning-row">
          <div className="winning-card">
            <div className="card-collage">
              <div className="main">
                <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800" />
              </div>

              <div className="side">
                <img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500" />
                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500" />
              </div>
            </div>

            <h3>Elevated blokette: stylish at the stadium</h3>

            <p>Fashion ❤️ +1</p>

            <span>93 Pins · 19h</span>
          </div>

          <div className="winning-card">
            <div className="card-collage">
              <div className="main">
                <img src="https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=1000" />
              </div>

              <div className="side">
                <img src="https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=500" />
                <img src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500" />
              </div>
            </div>

            <h3>Team spirit manicures</h3>

            <p>Beauty ❤️ +1</p>

            <span>53 Pins · 3w</span>
          </div>

          <div className="winning-card">
            <div className="card-collage">
              <div className="main">
                <img src="https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=1000" />
              </div>

              <div className="side">
                <img src="https://images.unsplash.com/photo-1547592180-85f173990554?w=500" />
                <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500" />
              </div>
            </div>

            <h3>Delicious dips for summer gatherings</h3>

            <p>Food ❤️ +1</p>

            <span>70 Pins · 11mo</span>
          </div>

          <div className="winning-card">
            <div className="card-collage">
              <div className="main">
                <img src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1000" />
              </div>

              <div className="side">
                <img src="https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=500" />
                <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500" />
              </div>
            </div>

            <h3>Styling soccer jerseys</h3>

            <p>StylePins Man ❤️ +1</p>

            <span>101 Pins · 16h</span>
          </div>
        </div>
      </section>

      {/* another section */}

      <section className="favoriteideas-section">
        <div className="favoriteideas-top">
          <h2>Bring your favorite ideas to life</h2>

          <p>
            With StylePins, you can unlock tools that spark your creativity and
            help you find more inspiration.
          </p>
        </div>

        <div className="favoriteideas-bottom">
          <div className="favoriteideas-row">
            <div className="favoriteideas-image">
              <img
                src="https://i.pinimg.com/736x/31/e8/45/31e8455b6b965b1b93b35c0b4466f836.jpg"
                alt=""
              />
            </div>

            <div className="favoriteideas-content">
              <h3>Search by skin tone</h3>

              <p>
                Search with skin tone ranges for beauty ideas that <br></br>{" "}
                represent you.
              </p>

              <button>Join StylePins</button>
            </div>
          </div>

          <div className="favoriteideas-row reverse">
            <div className="favoriteideas-content">
              <h3>Collaborate with group boards</h3>

              <p>
                Visualize your ideas with others, using a StylePins <br></br>{" "}
                account
              </p>

              <button>Join StylePins</button>
            </div>

            <div className="favoriteideas-image">
              <img
                src="https://i.pinimg.com/736x/81/b5/20/81b52024529990e2f09b2ba79cc400e7.jpg"
                alt=""
              />
            </div>
          </div>

          <div className="favoriteideas-row">
            <div className="favoriteideas-image">
              <img
                src="https://i.pinimg.com/736x/aa/6e/0c/aa6e0c763a7b742461b30c29a7dacda6.jpg"
                alt=""
              />
            </div>

            <div className="favoriteideas-content">
              <h3>Search visually with images</h3>

              <p>
                Search objects within an image to find<br></br> more styles
                you'll love
              </p>

              <button>Join StylePins</button>
            </div>
          </div>
        </div>
      </section>
      {/* StylePins Signup Section */}

      <section className="signup-section">
        <Masonry
          breakpointCols={{ default: 8, 1400: 7, 1100: 6, 800: 4, 500: 3 }}
          className="masonry-grid"
          columnClassName="masonry-column"
        >
          {Array.from({ length: 35 }).map((_, i) => {
            const heights = [180, 200, 260, 280];
            const height = heights[i % heights.length];

            return (
              <img
                key={i}
                src={`https://picsum.photos/500/${height}?random=${i}`}
                alt=""
                style={{
                  height: `${height}px`,
                  objectFit: "cover",
                }}
              />
            );
          })}
        </Masonry>
        <div className="signup-overlay"></div>

        <div className="signup-left">
          <h1>
            Sign up to get <br></br> your ideas
          </h1>
        </div>

        <div className="signup-card">
          <h2>Welcome to StylePins</h2>
          <p>Find new ideas to try</p>
          <label>Email</label>
          <input type="email" placeholder="Email" />
          <label>Password</label>
          <input type="password" placeholder="Password" />
          <label>Birthdate</label>
          <input type="text" placeholder="mm/dd/yyyy" />

          <button className="signup-btn">Continue</button>

          <div className="divider">OR</div>

          <button className="google-btn">Continue with Google</button>
          <p className="terms">
            By continuing, you agree to StylePins's Terms of Service and
            acknowledge you've read our Privacy Policy.
          </p>

          <p className="login-text">
            Already a member? <span>Log in</span>
          </p>

          <p className="business">Create a free business account</p>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Hero;
