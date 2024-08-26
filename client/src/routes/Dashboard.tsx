
const Dashboard = () => {

  // useEffect(() => {
  //   // Attach event listeners
  //   const handleConnect = () => {
  //     console.log("Socket connected");
  //   };

  //   const handleUserOnline = (userId: string) => {
  //     console.log("User online:", userId);
  //   };

  //   socket.on("connect", handleConnect);
  //   socket.on("userOnline", handleUserOnline);

  //   // Cleanup event listeners on component unmount
  //   return () => {
  //     socket.off("connect", handleConnect);
  //     socket.off("userOnline", handleUserOnline);
  //   };
  // }, []);

  return (
    <div className="bg-blue-100s h-full w-full flex items-center justify-center">
      <span className="text-lg font-semibold">
        Hello :) Create or continue with a chat!
      </span>
    </div>
  )
}

export default Dashboard