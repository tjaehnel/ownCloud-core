<fieldset id="ldapWizard4">
	<div>
		<p>
			<?php p($l->t('Groups meeting these criteria are available in %s:', $theme->getName()));?>
		</p>
		<p>
			<label for="ldap_groupfilter_objectclass">
				<?php p($l->t('Only these object classes:'));?>
			</label>

			<select id="ldap_groupfilter_objectclass" multiple="multiple"
			 name="ldap_groupfilter_objectclass">
			</select>
		</p>
		<p>
			<label for="ldap_groupfilter_groups">
				<?php p($l->t('Only from these groups:'));?>
			</label>

			<select id="ldap_groupfilter_groups" multiple="multiple"
			 name="ldap_groupfilter_groups">
			</select>
		</p>
		<p>
			<label><a id='toggleRawGroupFilter' class='ldapToggle'>↓ <?php p($l->t('Edit LDAP Query'));?></a></label>
		</p>
		<p id="ldapReadOnlyGroupFilterContainer" class="hidden ldapReadOnlyFilterContainer">
			<label><?php p($l->t('LDAP Filter:'));?></label>
			<span class="ldapFilterReadOnlyElement ldapInputColElement"></span>
		</p>
		<p id="rawGroupFilterContainer" class="invisible">
			<input type="text" id="ldap_group_filter" name="ldap_group_filter"
			class="lwautosave"
			placeholder="<?php p($l->t('Edit LDAP Query'));?>"
			title="<?php p($l->t('The filter specifies which LDAP groups shall have access to the %s instance.', $theme->getName()));?>"
			/>
			<button class="ldapGetEntryCount hidden" name="ldapGetEntryCount" type="button">
				<?php p($l->t('Test Filter'));?>
			</button>
		</p>
		<p>
			<div class="ldapWizardInfo invisible">&nbsp;</div>
		</p>
		<p class="ldap_count">
			<button class="ldapGetEntryCount ldapGetGroupCount" name="ldapGetEntryCount" type="button">
				<?php p($l->t('Verify settings and count groups'));?>
			</button>
			<span id="ldap_group_count"></span>
		</p>
		<?php print_unescaped($_['wizardControls']); ?>
	</div>
</fieldset>
