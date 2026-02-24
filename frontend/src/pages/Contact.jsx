import { Link } from 'react-router-dom';

export default function Contact() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 py-12 px-4 animate-fade-in">
			<div className="max-w-4xl mx-auto">
				<Link to="/" className="inline-flex items-center text-brand-600 hover:text-brand-700 mb-8 transition-colors">
					<span className="mr-2">←</span> Back to Home
				</Link>

				<div className="card-glass p-8 md:p-12">
					<h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
						Contact Us
					</h1>
					<p className="text-center text-gray-600 mb-8 text-lg">
						We're here to help societies and residents manage operations better.
					</p>

					<div className="grid md:grid-cols-2 gap-6 mb-8">
						<div className="bg-gradient-to-br from-blue-500 to-purple-500 p-6 rounded-xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
							<div className="text-5xl mb-4">📧</div>
							<h3 className="font-bold text-xl mb-2">Email Us</h3>
							<a href="mailto:support@themanager.in" className="text-white hover:text-gray-200 text-lg underline">
								support@themanager.in
							</a>
						</div>

						<div className="bg-gradient-to-br from-green-500 to-teal-500 p-6 rounded-xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
							<div className="text-5xl mb-4">📱</div>
							<h3 className="font-bold text-xl mb-2">Call Us</h3>
							<a href="tel:+919328961255" className="text-white hover:text-gray-200 text-lg underline">
								+91-9328961255
							</a>
						</div>

						<div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
							<div className="text-5xl mb-4">🕒</div>
							<h3 className="font-bold text-xl mb-2">Business Hours</h3>
							<p className="text-lg">Monday to Saturday</p>
							<p className="text-lg">10:00 AM – 6:00 PM</p>
						</div>

						<div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
							<div className="text-5xl mb-4">📍</div>
							<h3 className="font-bold text-xl mb-2">Office Address</h3>
							<p className="text-lg">The Manager</p>
							<p className="text-sm opacity-90">[Address To Be Updated]</p>
						</div>
					</div>

					<div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8 rounded">
						<p className="text-gray-700 flex items-center gap-3">
							<span className="text-2xl">💡</span>
							<span>For service inquiries, partnerships, or support requests, please reach out through our official contact channels. Our team will respond at the earliest.</span>
						</p>
					</div>

					{/* Legal Disclaimer */}
					<div className="border-t border-gray-200 pt-8 mt-8">
						<h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">⚖️ Legal Disclaimer</h3>
						<div className="text-gray-700 leading-relaxed space-y-3 bg-gray-50 p-6 rounded-xl">
							<p>• The information provided by The Manager is for operational and informational purposes only.</p>
							<p>• We do not provide legal, financial, or regulatory advice unless explicitly stated in writing.</p>
							<p>• Society decisions remain the responsibility of the respective managing committee.</p>
							<p>• The Manager operates as a professional support service and does not replace statutory authorities or governing bodies.</p>
							<p className="font-semibold text-center mt-4">Use of our services implies acceptance of this disclaimer.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
