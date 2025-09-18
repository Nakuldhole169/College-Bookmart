import Carousel from "react-bootstrap/Carousel";
import '../index.css'; 
import '../styles/home.css'; 


export default function HomePage() {
  return (
    <div className="w-full">
      <Carousel>
        <Carousel.Item interval={1000}>
          <img
            src="/bookstore-corosouel.jpg"
            alt="bookstore"
            className="home-img"
          />
          <Carousel.Caption>
            <h3 className="text-white text-2xl font-bold">OneStop-BookMart</h3>
            <p className="text-gray-200 text-sm md:text-base">
              Discover a World of Knowledge and Imagination at Bookmart - Your
              One-Stop Destination for Quality Stationery, Reliable Printout
              Services, and More.
            </p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item interval={500}>
          <img
            src="/stat-corosouel.jpg"
            alt="stationery"
            className="home-img"
          />
          <Carousel.Caption>
            <h3 className="text-white text-2xl font-bold">Stationery Items</h3>
            <p className="text-gray-200 text-sm md:text-base">
              Unleash Creativity with Our Stationery Collection - Where Every
              Blank Page Holds the Potential for Inspiration!
            </p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            src="/print-corosouel.jpg"
            alt="print"
            className="home-img"
          />
          <Carousel.Caption>
            <h3 className="text-white text-2xl font-bold">Prints</h3>
            <p className="text-gray-200 text-sm md:text-base">
              Bring Your Ideas to Life with Precision and Clarity - Explore Our
              Printout Services for Crisp and Vibrant Documents!
            </p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      <section className="text-box">
        <p >
          Explore our collection of college books and stationery items.
        </p>
      </section>
    </div>
  );
}
