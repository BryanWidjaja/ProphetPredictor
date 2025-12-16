import Navbar from "../components/Navbar";
import CSVUploader from "../components/CSVUploader";

function Home() {
  return (
    <>
      <Navbar></Navbar>
      <section className="main-section">
        <CSVUploader></CSVUploader>
      </section>
    </>
  );
}

export default Home;
