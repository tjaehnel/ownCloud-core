<fieldset id="ldapWizard3">
	<div>
		<p>
			<?php p($l->t('When logging in, %s will find the user based on the following attributes:', $theme->getName()));?>
		</p>
		<p>
			<label for="ldap_loginfilter_username">
				<?php p($l->t('LDAP / AD Username:'));?>
			</label>

			<input type="checkbox" id="ldap_loginfilter_username"
				   title="<?php p($l->t('Allows login against the LDAP / AD username, which is either uid or samaccountname and will be detected.'));?>"
				   name="ldap_loginfilter_username" value="1" class="lwautosave" />
		</p>
		<p>
			<label for="ldap_loginfilter_email">
				<?php p($l->t('LDAP / AD Email Address:'));?>
			</label>

			<input type="checkbox" id="ldap_loginfilter_email"
				   title="<?php p($l->t('Allows login against an email attribute. Mail and mailPrimaryAddress will be allowed.'));?>"
				   name="ldap_loginfilter_email" value="1" class="lwautosave" />
		</p>
		<p>
			<label for="ldap_loginfilter_attributes">
				<?php p($l->t('Other Attributes:'));?>
			</label>

			<select id="ldap_loginfilter_attributes" multiple="multiple"
			 name="ldap_loginfilter_attributes">
			</select>
		</p>
		<p>
			<label><a id='toggleRawLoginFilter'>↓ <?php p($l->t('Edit LDAP Query'));?></a></label>
		</p>
		<p id="rawLoginFilterContainer" class="invisible">
			<input type="text" id="ldap_login_filter" name="ldap_login_filter"
				class="lwautosave ldapFilterInputElement"
				placeholder="<?php p($l->t('Edit LDAP Query'));?>"
				title="<?php p($l->t('Defines the filter to apply, when login is attempted. %%uid replaces the username in the login action. Example: "uid=%%uid"'));?>"
			/>
		</p>
		<p>
			<div class="ldapWizardInfo invisible">&nbsp;</div>
		</p>

		<?php print_unescaped($_['wizardControls']); ?>
	</div>
</fieldset>