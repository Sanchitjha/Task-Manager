import { Link } from 'react-router-dom';

export default function TermsConditions() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 py-20 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="card-glass p-8 md:p-12">
					<h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
						Terms & Conditions
					</h1>

					<div className="text-gray-700 leading-relaxed space-y-6">
						<p>
							By accessing or using The Manager services, users agree to comply with the following Terms & Conditions. These terms govern the use of our services by housing societies, committee members, residents, vendors, and partners.
						</p>

						<div>
							<h2 className="text-2xl font-bold text-gray-800 mb-3">Service Scope</h2>
							<p>
								The Manager provides operational coordination, process management, and structured support services for housing societies. We act as a management support partner and do not directly execute physical services unless explicitly stated.
							</p>
						</div>

						<div>
							<h2 className="text-2xl font-bold text-gray-800 mb-3">User Responsibilities</h2>
							<p>
								Users agree to provide accurate information and cooperate during service coordination. Misuse of services, false complaints, or unauthorized activities may result in service suspension.
							</p>
						</div>

						<div>
							<h2 className="text-2xl font-bold text-gray-800 mb-3">Vendor & Third-Party Services</h2>
							<p>
								Services delivered through vendors or partners are subject to their availability and performance. The Manager facilitates coordination but is not liable for independent vendor actions beyond agreed scopes.
							</p>
						</div>

						<div>
							<h2 className="text-2xl font-bold text-gray-800 mb-3">Payments & Fees</h2>
							<p>
								Service fees, if applicable, are defined through formal agreements with societies or users. All payments are subject to agreed terms.
							</p>
						</div>

						<div>
							<h2 className="text-2xl font-bold text-gray-800 mb-3">Limitation of Liability</h2>
							<p>
								The Manager shall not be held liable for indirect losses, delays, or damages arising from circumstances beyond reasonable control.
							</p>
						</div>

						<div>
							<h2 className="text-2xl font-bold text-gray-800 mb-3">Termination</h2>
							<p>
								We reserve the right to suspend or terminate services in case of misuse, breach of terms, or non-compliance.
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
