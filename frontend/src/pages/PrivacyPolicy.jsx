import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 py-20 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="card-glass p-8 md:p-12">
					<h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
						Privacy Policy
					</h1>

					<div className="text-gray-700 leading-relaxed space-y-6">
						<p>
							At The Manager, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and safeguard data provided by residents, society committees, vendors, and visitors to our platform.
						</p>

						<div>
							<h2 className="text-2xl font-bold text-gray-800 mb-3">Information We Collect</h2>
							<p>
								We may collect basic personal and operational information such as name, contact details, flat number, society details, service requests, and communication records. This information is collected only to deliver our services effectively and improve user experience.
							</p>
						</div>

						<div>
							<h2 className="text-2xl font-bold text-gray-800 mb-3">Use of Information</h2>
							<p className="mb-3">Collected data is used strictly for:</p>
							<ul className="list-disc list-inside space-y-2 ml-4">
								<li>Society operations management</li>
								<li>Service coordination and communication</li>
								<li>Complaint tracking and resolution</li>
								<li>Improving platform functionality</li>
								<li>Compliance and internal reporting</li>
							</ul>
							<p className="mt-3">
								We do not sell or rent personal data to third parties.
							</p>
						</div>

						<div>
							<h2 className="text-2xl font-bold text-gray-800 mb-3">Data Protection</h2>
							<p>
								We implement reasonable administrative, technical, and organizational measures to protect your information from unauthorized access, misuse, or disclosure. Access to data is limited to authorized personnel only.
							</p>
						</div>

						<div>
							<h2 className="text-2xl font-bold text-gray-800 mb-3">Data Sharing</h2>
							<p>
								Information may be shared with verified service partners or vendors strictly for service fulfillment. All partners are expected to follow confidentiality standards.
							</p>
						</div>

						<div>
							<h2 className="text-2xl font-bold text-gray-800 mb-3">User Rights</h2>
							<p>
								Users may request access, correction, or deletion of their personal information by contacting us through official communication channels.
							</p>
						</div>

						<div>
							<h2 className="text-2xl font-bold text-gray-800 mb-3">Policy Updates</h2>
							<p>
								This Privacy Policy may be updated periodically. Continued use of our services indicates acceptance of the revised policy.
							</p>
						</div>
					</div>

					<div className="mt-8 text-center">
						<Link to="/" className="text-brand-600 hover:text-brand-700 font-semibold">
							← Back to Home
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
