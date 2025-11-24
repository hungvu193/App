import React, {useCallback} from 'react';
import {View} from 'react-native';
import AmountForm from '@components/AmountForm';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {goBackFromInvalidPolicy, isControlPolicy, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {personalDetailsByEmailSelector} from '@src/selectors/PersonalDetails';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceWorkflowsForwardLimitToPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_FORWARD_LIMIT_TO>;

function WorkspaceWorkflowsForwardLimitToPage({policy, isLoadingReportData = true, route}: WorkspaceWorkflowsForwardLimitToPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {policyID} = route.params || {};
    const [approvalWorkflow] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW, {canBeMissing: true});
    const approverCount = approvalWorkflow?.approvers?.length ?? 0;
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
    const subtitleText = `<comment><muted-text-label>${translate('workflowsForwardLimitToPage.subtitle', {approverDisplayName: approverDisplayName ?? ''})}</muted-text-label></comment>`;
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || isPendingDeletePolicy(policy);

    const bottomButtonContainerStyles = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true, style: [styles.mb5]});

    const addAdditionalApprover = useCallback(() => {
        if (!isControlPolicy(policy) && approverCount > 0) {
            Navigation.navigate(
                ROUTES.WORKSPACE_UPGRADE.getRoute(
                    policyID,
                    CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.alias,
                    ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, approverCount),
                ),
            );
            return;
        }
        Navigation.navigate(
            ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(
                policyID,
                approverCount,
                ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_FORWARD_LIMIT_TO.getRoute(policyID, currentApprover?.email ?? ''),
            ),
        );
    }, [approverCount, policy, policyID, currentApprover?.email]);

    const submitApprovalLimit = useCallback(() => {
        // handle submit
    }, [approvalWorkflow, currentApprover, personalDetailsByEmail, policy, route.params.policyID]);

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
                    <View style={[styles.flexGrow1, styles.mh5]}>
                        <View style={[styles.mb4, styles.flex1]}>
                            <Text style={[styles.textHeadlineH1, styles.mb3]}>{translate('workflowsForwardLimitToPage.header')}</Text>
                            <View style={[styles.flexRow, styles.renderHTML, styles.pb5]}>
                                <RenderHTML html={subtitleText} />
                            </View>

                            <AmountForm
                                value={defaultApprovalLimit}
                                label={translate('workflowsForwardLimitToPage.reportAmount')}
                                currency={currency}
                                isCurrencyPressable={false}
                                displayAsTextInput
                            />

                            <MenuItemWithTopDescription
                                description={approverCount > 0 ? translate('workflowsCreateApprovalsPage.additionalApprover') : translate('workflowsPage.approver')}
                                onPress={addAdditionalApprover}
                                shouldShowRightIcon
                                wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt4]}
                                errorText={approvalWorkflow?.errors?.additionalApprover ? translate(approvalWorkflow.errors.additionalApprover) : undefined}
                                brickRoadIndicator={approvalWorkflow?.errors?.additionalApprover ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            />
                        </View>
                        <View style={bottomButtonContainerStyles}>
                            <Button
                                large
                                text={translate('common.skip')}
                                style={styles.mb4}
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
