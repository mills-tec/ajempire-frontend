import AdminAuth from "../components/auth-component/AdminAuth";
import AdminAuthStep from "../components/auth-component/AdminAuthStep";

export default function AdminLogin() {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <AdminAuthStep />
        </div>
    )
}
