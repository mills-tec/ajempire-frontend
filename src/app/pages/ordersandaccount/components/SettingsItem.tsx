import Link from "next/link";

type SettingsItemProps = {
    label: string;
    value?: string;
    href?: string;
};

const SettingsItem = ({ label, value, href }: SettingsItemProps) => {
    const Content = (
        <div className="flex items-center justify-between py-5 border-b border-gray-200 cursor-pointer">
            <p className="text-sm text-gray-700">{label}</p>

            <div className="flex items-center gap-3">
                {value && <p className="text-sm text-gray-500">{value}</p>}

                <svg
                    width="12"
                    height="24"
                    viewBox="0 0 12 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.1569 12.7116L4.49994 18.3686L3.08594 16.9546L8.03594 12.0046L3.08594 7.05463L4.49994 5.64062L10.1569 11.2976C10.3444 11.4852 10.4497 11.7395 10.4497 12.0046C10.4497 12.2698 10.3444 12.5241 10.1569 12.7116Z"
                        fill="#929292"
                    />
                </svg>
            </div>
        </div>
    );

    // If link exists → wrap with Link
    if (href) {
        return <Link href={href}>{Content}</Link>;
    }

    return Content;
};

export default SettingsItem;
