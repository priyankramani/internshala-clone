import axios from "axios";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { toast } from "react-toastify";

export default function SubscriptionPage() {
  const user = useSelector(selectuser);

  const buyPlan = async (plan: string) => {
    try {
      const { data } = await axios.post(
        "https://internshala-clone-uclt.onrender.com/api/resume/create-subscription-order",
        { plan },
      );

      const options = {
        key: "rzp_test_SdOlrkVOSi3Smb",
        amount: data.amount,
        currency: "INR",
        name: "InternArea",
        description: `${plan} Plan`,
        order_id: data.id,

        handler: async function (response: any) {
          // VERIFY PAYMENT
          const verify = await axios.post(
            "https://internshala-clone-uclt.onrender.com/api/resume/verify-payment",
            response,
          );

          if (!verify.data.success) {
            toast.error("Payment failed");
            return;
          }

          // ACTIVATE
          await axios.post(
            "https://internshala-clone-uclt.onrender.com/api/resume/activate-subscription",
            {
              // userId: user?._id,
              email: user?.email,
              plan,
            },
          );

          toast.success(`${plan} Activated 🎉`);
          window.location.href = "/profile";
        },
      };

      new (window as any).Razorpay(options).open();
    } catch (err: any) {
      toast.error(err.response?.data?.message);
    }
  };

  return (
    <div className="p-10 grid grid-cols-3 gap-6">
      {[
        { name: "bronze", price: 100, limit: 3 },
        { name: "silver", price: 300, limit: 5 },
        { name: "gold", price: 1000, limit: "Unlimited" },
      ].map((plan) => (
        <div key={plan.name} className="p-6 border rounded-lg shadow">
          <h2 className="text-xl font-bold capitalize">{plan.name}</h2>
          <p className="text-2xl">₹{plan.price}</p>
          <p>{plan.limit} Applications</p>

          <button
            onClick={() => buyPlan(plan.name)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Buy
          </button>
        </div>
      ))}
    </div>
  );
}
