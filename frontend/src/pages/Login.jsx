// Simple Login component with no external dependencies
export default function Login() {
	return (
		<div style={{ 
			minHeight: '100vh', 
			backgroundColor: '#f5f5f5', 
			display: 'flex', 
			alignItems: 'center', 
			justifyContent: 'center',
			padding: '1rem'
		}}>
			<div style={{
				maxWidth: '400px',
				width: '100%',
				backgroundColor: 'white',
				borderRadius: '8px',
				boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
				padding: '2rem'
			}}>
				<div style={{ textAlign: 'center', marginBottom: '2rem' }}>
					<h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
						The Manager
					</h1>
					<p style={{ color: '#666' }}>
						Login or Create Account
					</p>
				</div>
				
				<div style={{ marginBottom: '1rem' }}>
					<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
						Email
					</label>
					<input 
						type="email"
						style={{
							width: '100%',
							padding: '0.75rem',
							border: '1px solid #ddd',
							borderRadius: '6px',
							fontSize: '1rem'
						}}
						placeholder="Enter your email"
					/>
				</div>
				
				<div style={{ marginBottom: '1rem' }}>
					<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
						Password
					</label>
					<input 
						type="password"
						style={{
							width: '100%',
							padding: '0.75rem',
							border: '1px solid #ddd',
							borderRadius: '6px',
							fontSize: '1rem'
						}}
						placeholder="Enter your password"
					/>
				</div>
				
				<button 
					style={{
						width: '100%',
						padding: '0.75rem',
						backgroundColor: '#007bff',
						color: 'white',
						border: 'none',
						borderRadius: '6px',
						fontSize: '1rem',
						cursor: 'pointer',
						marginBottom: '1rem'
					}}
					onClick={() => alert('Login button clicked!')}
				>
					Sign In
				</button>
				
				<div style={{ textAlign: 'center' }}>
					<button 
						style={{
							background: 'none',
							border: 'none',
							color: '#007bff',
							cursor: 'pointer',
							textDecoration: 'underline'
						}}
						onClick={() => alert('Registration will be implemented')}
					>
						Don't have an account? Sign up
					</button>
				</div>
			</div>
		</div>
	);
}
