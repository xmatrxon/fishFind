import { useState } from "react";
import Select from "react-select";
import { db } from "../config/firebase";
import { storage } from "../config/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { useFormik } from "formik";
import { voivodeshipList } from "../voivodeshipList";
import { fishList } from "../fishList";
import * as Yup from "yup";
import { Tooltip } from "react-tooltip";
import { v4 } from "uuid";

const NewFormPopup = (props) => {
  const [voivodeship, setVoivodeship] = useState("");
  const [fish, setFish] = useState("");
  const [clickedButton, setClickedButton] = useState(false);

  const isVisible = true;

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      rules: "",
      city: "",
      image: null,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .max(30, "Maksymalna ilość znaków to 30")
        .required("Nazwa łowiska jest wymagana"),
      description: Yup.string()
        .required("Opis łowiska jest wymagany")
        .max(300, "Maksymalna ilość znaków to 300"),
      rules: Yup.string()
        .required("Regulamin łowiska jest wymagany")
        .max(300, "Maksymalna ilość znaków to 300"),
      voivodeship: Yup.string().required("Województwo jest wymagane"),
      fish: Yup.array().required("Conajmniej jeden gatunek jest wymagany"),
      city: Yup.string()
        .required("Miasto jest wymagane")
        .max(100, "Maksymalna ilość znaków to 100"),
      image: Yup.mixed()
        .required("Zdjęcie łowiska jest wymagane")
        .test(
          "fileFormat",
          "Obsługiwane formaty plików to JPG, PNG oraz JPEG",
          (value) => {
            if (!value) return true;

            const supportedFormats = ["image/jpeg", "image/png", "image/jpg"];
            return supportedFormats.includes(value.type);
          },
        )
        .test(
          "fileSize",
          "Maksymalny dopuszcalny rozmiar zdjecia to 10MB",
          (value) => {
            const MAX_PHOTO_SIZE = 10485760;
            return value.size <= MAX_PHOTO_SIZE;
          },
        ),
    }),
    onSubmit: async () => {
      const markersCollectionRef = collection(db, "markers");

      try {
        let imageURL = null;

        const imageRef = ref(
          storage,
          `waterImages/${formik.values.image.name + v4()}`,
        );
        const snapshot = await uploadBytes(imageRef, formik.values.image);
        imageURL = await getDownloadURL(snapshot.ref);

        await addDoc(markersCollectionRef, {
          id: Date.now(),
          name: formik.values.name,
          voivodeship: voivodeship,
          city: formik.values.city,
          description: formik.values.description,
          rules: formik.values.rules,
          fish: fish,
          lon: props.lng,
          lat: props.lat,
          waterId: props.clickedWaterId,
          UID: props.uid,
          imageURL: imageURL,
        }).then(() => {
          handlePopupClick();
          props.pass(true);
          formik.resetForm();
          setFish("");
          setVoivodeship("");
        });
      } catch (err) {
        console.log(err);
      }
    },
  });

  const handleFish = (data) => {
    setFish(data);
    const selectedFishValues = data.map((fishOption) => fishOption.value);
    formik.setFieldValue("fish", selectedFishValues);
    formik.setFieldTouched("fish", true);
  };

  const handleVoivodeship = (data) => {
    setVoivodeship(data);
    formik.setFieldValue("voivodeship", data.value);
    formik.setFieldTouched("voivodeship", true);
  };

  const handlePopupClick = () => {
    props.setTrigger(false);
    setFish("");
    setVoivodeship("");
    formik.setFieldValue("name", "");
    formik.setFieldTouched("name", false);
    formik.setFieldValue("description", "");
    formik.setFieldTouched("description", false);
    formik.setFieldValue("rules", "");
    formik.setFieldTouched("rules", false);
    formik.setFieldValue("city", "");
    formik.setFieldTouched("city", false);
  };

  return props.trigger ? (
    <>
      <div
        onClick={handlePopupClick}
        className={`popup-water popup-background ${
          isVisible ? "visible" : "hidden"
        }`}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: isVisible ? "fadeIn 0.3s linear" : "fadeOut 0.3s linear",
          }}
          className="content">
          <div className="header-div">
            <h1>Dodaj łowisko</h1>
            <div onClick={handlePopupClick} className="button-div">
              <button
                aria-label="Close popup"
                className="focus:shadow-outline t-0 mb-5 flex rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
                type="button"
                onClick={() => props.setTrigger(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-x"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M18 6l-12 12" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="form-div">
            <form onSubmit={formik.handleSubmit} className="shadow-md">
              <div className="input-div">
                <input
                  aria-label="Name"
                  className="focus:shadow-outline w-full appearance-none rounded border leading-tight text-gray-700 shadow focus:outline-none"
                  id="name"
                  type="text"
                  placeholder="Nazwa łowiska"
                  name="name"
                  onChange={(e) =>
                    formik.handleChange({
                      target: {
                        name: "name",
                        value:
                          e.target.value.charAt(0).toUpperCase() +
                          e.target.value.slice(1),
                      },
                    })
                  }
                  onBlur={formik.handleBlur}
                  value={formik.values.name}
                />
                {formik.touched.name && formik.errors.name ? (
                  <p className="text-xs italic text-red-500">
                    {formik.errors.name}
                  </p>
                ) : null}
              </div>
              <div className="input-div">
                <input
                  aria-label="Description"
                  className="focus:shadow-outline w-full appearance-none rounded border leading-tight text-gray-700 shadow focus:outline-none"
                  id="description"
                  type="text"
                  placeholder="Opis łowiska"
                  name="description"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.description}
                />
                {formik.touched.description && formik.errors.description ? (
                  <p className="text-xs italic text-red-500">
                    {formik.errors.description}
                  </p>
                ) : null}
              </div>
              <div className="input-div">
                <div className="flex">
                  <textarea
                    className="focus:shadow-outline max-h-40 w-full appearance-none rounded border leading-tight text-gray-700 shadow focus:outline-none"
                    id="rules"
                    type="text"
                    placeholder="Regulamin łowiska"
                    rows="2"
                    name="rules"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.rules}
                  />
                  <Tooltip id="my-tooltip" className="z-10" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-info-circle self-center"
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content='Jeżeli obowiązuje regulamin PZW wpisz "Regulamin PZW"'>
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                    <path d="M12 9h.01" />
                    <path d="M11 12h1v4h1" />
                  </svg>
                </div>
                {formik.touched.rules && formik.errors.rules ? (
                  <p className="text-xs italic text-red-500">
                    {formik.errors.rules}
                  </p>
                ) : null}
              </div>
              <div className="input-div">
                <input
                  aria-label="City"
                  className="focus:shadow-outline w-full appearance-none rounded border leading-tight text-gray-700 shadow focus:outline-none"
                  id="city"
                  type="text"
                  placeholder="Miasto"
                  name="city"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.city}
                />
                {formik.touched.city && formik.errors.city ? (
                  <p className="text-xs italic text-red-500">
                    {formik.errors.city}
                  </p>
                ) : null}
              </div>
              <div className="input-div">
                <Select
                  aria-label="Voivodeship"
                  options={voivodeshipList}
                  placeholder="Województwo"
                  value={voivodeship}
                  onChange={handleVoivodeship}
                  onBlur={formik.handleBlur}
                  isMulti={false}
                />
                {(formik.touched.voivodeship || clickedButton) &&
                formik.errors.voivodeship ? (
                  <p className="text-xs italic text-red-500">
                    {formik.errors.voivodeship}
                  </p>
                ) : null}
              </div>
              <div className="input-div">
                <Select
                  aria-label="Fish"
                  options={fishList}
                  placeholder="Występujące ryby"
                  value={fish}
                  onChange={handleFish}
                  onBlur={formik.handleBlur}
                  isMulti
                />
                {(formik.touched.fish || clickedButton) &&
                formik.errors.fish ? (
                  <p className="text-xs italic text-red-500">
                    {formik.errors.fish}
                  </p>
                ) : null}
              </div>
              <div className="input-div">
                <div className="flex justify-center">
                  <input
                    aria-label="File"
                    type="file"
                    name="image"
                    onChange={(event) =>
                      formik.setFieldValue(
                        "image",
                        event.currentTarget.files[0],
                      )
                    }
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-info-circle self-center"
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content="Obługiwane formaty zdjęć to PNG, JPG oraz JPEG. Maksymalny rozmiar zdjęcia to 10MB">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                    <path d="M12 9h.01" />
                    <path d="M11 12h1v4h1" />
                  </svg>
                </div>
                {(formik.touched.image || clickedButton) &&
                formik.errors.image ? (
                  <p className="text-xs italic text-red-500">
                    {formik.errors.image}
                  </p>
                ) : null}
              </div>
              <div className="button-div">
                <button
                  aria-label="Add"
                  className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                  type="submit"
                  onClick={() => setClickedButton(true)}>
                  Dodaj
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  ) : null;
};

export default NewFormPopup;
