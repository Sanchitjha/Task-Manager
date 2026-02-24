import { Link } from 'react-router-dom';

export default function SecurityPolicy() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 py-20 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="card-glass p-8 md:p-12">
					<h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
						Security Policy
					</h1>

					<div className="text-gray-700 leading-relaxed space-y-6">
						<p>
							At The Manager, data security is a priority. We adopt structured measures to protect information related to societies, residents, and operations.
						</p>

						<div>
							<h2 className="text-2xl font-bold text-gray-800 mb-3">Security Measures</h2>
							<ul className="list-disc list-inside space-y-2 ml-4">
								<li>Controlled access to systems and data</li>
								<li>Role-based authorization</li>
								<li>Secure data storage practices</li>
								<li>Regular internal reviews</li>
							</ul>
						</div>

						<div>
							<h2 className="text-2xl font-bold text-gray-800 mb-3">Data Access</h2>
							<p>
								Only authorized personnel can access sensitive information, strictly for operational purposes.
							</p>
						</div>

						<div>
							<h2 className="text-2xl font-bold text-gray-800 mb-3">Incident Handling</h2>
							<p>
								Any suspected security incident is investigated promptly, and corrective action is taken to minimize impact.
							</p>
						</div>

						<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
							<p className="text-gray-700">
								While we follow best practices, no system can guarantee absolute security. Users are encouraged to follow safe usage practices.
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
