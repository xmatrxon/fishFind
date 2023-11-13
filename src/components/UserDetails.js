const UserDetails = ({ authUser }) => {
  return (
    <>
      {authUser ? (
        <>
          <p>{`Zalogowano jako ${authUser.email}`}</p>
        </>
      ) : null}
    </>
  );
};

export default UserDetails;
