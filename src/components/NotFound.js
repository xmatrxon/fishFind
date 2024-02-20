import Footer from "./Footer";

const NotFound = () => {
  return (
    <>
      <div className="notfound">
        <div>
          <h1 className="err-code">Error 404</h1>
          <h1 className="err-msg">Nie znaleziono strony</h1>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;
