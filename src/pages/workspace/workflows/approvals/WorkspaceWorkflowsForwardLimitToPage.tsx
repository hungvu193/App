import React, { useCallback } from 'react';
import { View } from 'react-native';
import AmountForm from '@components/AmountForm';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import type { FormInputErrors, FormOnyxValues } from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import { convertToBackendAmount, convertToFrontendAmountAsString } from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type { PlatformStackScreenProps } from '@libs/Navigation/PlatformStackNavigation/types';
import type { WorkspaceSplitNavigatorParamList } from '@libs/Navigation/types';
import { goBackFromInvalidPolicy, isPendingDeletePolicy, isPolicyAdmin } from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type { WithPolicyAndFullscreenLoadingProps } from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import { isEmptyObject } from '@src/types/utils/EmptyObject';
import RenderHTML from '@components/RenderHTML';
import Button from '@components/Button';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import ROUTES from '@src/ROUTES';
import { setApprovalWorkflowApprover } from '@libs/actions/Workflow';
import { personalDetailsByEmailSelector } from '@src/selectors/PersonalDetails';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';

type WorkspaceWorkflowsForwardLimitToPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_FORWARD_LIMIT_TO>;

function WorkspaceWorkflowsForwardLimitToPage({ policy, isLoadingReportData = true, route }: WorkspaceWorkflowsForwardLimitToPageProps) {
    const styles = useThemeStyles();
    const { translate } = useLocalize();
    const {policyID} = route.params || {};
    const [approvalWorkflow] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW, { canBeMissing: true });
    const approverCount = (approvalWorkflow?.approvers?.length ?? 0);
    const [personalDetailsByEmail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
        selector: personalDetailsByEmailSelector,
    });
    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    // Get the current approval limit from the first approver
    const currentApprover = approvalWorkflow?.approvers.at(0);
    const currentApprovalLimit = policy?.employeeList?.[currentApprover?.email ?? '']?.approvalLimit;
    const currentOverLimitForwardsTo = policy?.employeeList?.[currentApprover?.email ?? '']?.overLimitForwardsTo;
    const defaultApprovalLimit = convertToFrontendAmountAsString(currentApprovalLimit ?? 0, currency);
    const approverDisplayName = currentApprover?.displayName;
    const subtitleText = `<comment><muted-text-label>${translate('workflowsForwardLimitToPage.subtitle', { approverDisplayName: approverDisplayName ?? '' })}</muted-text-label></comment>`
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || isPendingDeletePolicy(policy);

    const bottomButtonContainerStyles = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true, style: [styles.mb5]});

    const validate = useCallback(
        ({ approvalLimit, overLimitForwardsTo }: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_APPROVAL_LIMIT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_APPROVAL_LIMIT_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_APPROVAL_LIMIT_FORM> = {};

            const limitAmount = parseFloat(approvalLimit);
            if (Number.isNaN(limitAmount) || limitAmount <= 0) {
                errors[INPUT_IDS.APPROVAL_LIMIT] = translate('workflowsForwardLimitToPage.invalidAmount');
            }

            if (!overLimitForwardsTo || overLimitForwardsTo.trim() === '') {
                errors[INPUT_IDS.OVER_LIMIT_FORWARDS_TO] = translate('common.error.fieldRequired');
            }

            return errors;
        },
        [translate],
    );

    const submitApprovalLimit = useCallback(
        () => {
            // handle submit
        },
        [approvalWorkflow, currentApprover, personalDetailsByEmail, policy, route.params.policyID],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID={WorkspaceWorkflowsForwardLimitToPage.displayName}
                shouldEnableMaxHeight
            >
                <FullPageNotFoundView
                    shouldShow={shouldShowNotFoundView}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    onBackButtonPress={goBackFromInvalidPolicy}
                    onLinkPress={goBackFromInvalidPolicy}
                    addBottomSafeAreaPadding
                >
                    <HeaderWithBackButton
                        title={translate('workflowsForwardLimitToPage.title')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <View
                        style={[styles.flexGrow1, styles.mh5]}
                    >
                        <View style={[styles.mb4, styles.flex1]}>
                            <Text style={[styles.textHeadlineH1, styles.mb3]}>{translate('workflowsForwardLimitToPage.header')}</Text>
                            <View style={[styles.flexRow, styles.renderHTML, styles.pb5]}>
                                <RenderHTML html={subtitleText} />
                            </View>

                            <AmountForm
                                value={defaultApprovalLimit}
                                label={translate('workflowsForwardLimitToPage.reportAmount')}
                                currency={currency}
                                defaultValue={defaultApprovalLimit}
                                isCurrencyPressable={false}
                                displayAsTextInput
                            />
                        </View>
                        <View style={bottomButtonContainerStyles}>
                            <Button
                                large
                                text={translate('common.skip')}
                                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(route.params.policyID))}
                            />
                            <FormAlertWithSubmitButton
                                onSubmit={submitApprovalLimit}
                                buttonText={translate('common.next')}
                                enabledWhenOffline
                            />
                        </View>
                    </View>
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsForwardLimitToPage.displayName = 'WorkspaceWorkflowsForwardLimitToPage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsForwardLimitToPage);
