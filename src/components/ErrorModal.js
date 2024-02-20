const ErrorModal = (props) => {
  const isError = true;

  const handlePopupClick = () => {
    props.setTrigger(false);
  };

  return props.trigger ? (
    <>
      <div
        onClick={handlePopupClick}
        className={`popup-background ${isError ? "visible" : "hidden"}`}>
        <div
          style={{
            animation: isError ? "fadeIn 0.3s linear" : "fadeOut 0.3s linear",
          }}
          className="relative flex rounded border border-red-400 !bg-red-100 px-7 py-3 text-red-700"
          onClick={(e) => e.stopPropagation()}>
          <div>
            <strong className="font-bold">Uwaga! </strong>
            <span className="block sm:inline">{props.errorMsg}</span>
          </div>
          <div className="ml-4">
            <button aria-label="Close error" onClick={handlePopupClick}>
              <svg
                className="h-6 w-6 fill-current text-red-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  ) : null;
};

export default ErrorModal;
