<template>
	<div class="row mt-5">
		<div class="col-12 col-sm-10 col-md-8 col-xl-6 offset-sm-1 offset-md-2 offset-xl-3">
			<form class="form-row bg-primary-50 rounded pb-4 px-3 pb-sm-5 px-sm-5 my-5">
				<div class="col-12 text-center px-5 mb-3">
					<div class="bg-light p-3 rounded-circle border border-dark kanjimi-login-icon">
						<img src="./img/logo.svg" alt="Logo" class="mw-100" />
					</div>
					<h1 class="mt-1 mb-0">Sign in</h1>
				</div>

				<div class="col-12">
					<div class="input-group">
						<div class="input-group-prepend bg-gray text-black">
							<div class="input-group-text bg-gray text-black">
								<i class="fas fa-at"></i>
							</div>
						</div>
						<input
							type="email"
							class="form-control"
							name="email"
							placeholder="Email"
							title="Account email"
							required
						/>
					</div>
				</div>

				<div class="col-12 mt-3">
					<div class="input-group">
						<div class="input-group-prepend bg-gray text-black">
							<div class="input-group-text bg-gray text-black">
								<i class="fas fa-key"></i>
							</div>
						</div>
						<input
							type="password"
							class="form-control"
							name="password"
							placeholder="Password"
							title="Account password"
							required
						/>
					</div>
				</div>

				<div class="col-12 mt-3">
					<button type="submit" class="btn btn-secondary btn-lg w-100">Login</button>
				</div>
			</form>
		</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';

	export default Vue.extend({});
</script>
<style scoped>
	.kanjimi-login-icon {
		width: 100px;
		margin: auto;
		margin-top: -50px;
	}
</style>
