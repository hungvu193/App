import {useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportPrimaryAction from '@hooks/useReportPrimaryAction';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
<<<<<<< HEAD
import type {KYCFlowEvent, TriggerKYCFlow} from '@libs/PaymentUtils';
import {handleUnvalidatedAccount, selectPaymentType} from '@libs/PaymentUtils';
import {getConnectedIntegration, getValidConnectedIntegration, isPolicyAccessible, sortPoliciesByName} from '@libs/PolicyUtils';
import {
    getFilteredReportActionsForReportView,
    getIOUActionForTransactionID,
    getOneTransactionThreadReportID,
    getOriginalMessage,
    hasRequestFromCurrentAccount,
    isMoneyRequestAction,
} from '@libs/ReportActionsUtils';
import {getReportPrimaryAction} from '@libs/ReportPrimaryActionUtils';
import {getSecondaryExportReportActions, getSecondaryReportActions} from '@libs/ReportSecondaryActionUtils';
import {
    canEditFieldOfMoneyRequest,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    changeMoneyRequestHoldStatus,
    generateReportID,
    getAddExpenseDropdownOptions,
    getIntegrationIcon,
    getIntegrationNameFromExportMessage as getIntegrationNameFromExportMessageUtils,
    getNextApproverAccountID,
    getPolicyExpenseChat,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasUpdatedTotal,
    hasViolations as hasViolationsReportUtils,
    isAllowedToApproveExpenseReport,
    isCurrentUserSubmitter,
    isDM,
    isExported as isExportedUtils,
    isInvoiceReport as isInvoiceReportUtil,
    isIOUReport as isIOUReportUtil,
    isOpenReport,
    isReportOwner,
    isSelfDM,
    navigateOnDeleteExpense,
    navigateToDetailsPage,
    shouldBlockSubmitDueToStrictPolicyRules,
} from '@libs/ReportUtils';
import shouldPopoverUseScrollView from '@libs/shouldPopoverUseScrollView';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {
    getChildTransactions,
    getOriginalTransactionWithSplitInfo,
    hasAnyPendingRTERViolation as hasAnyPendingRTERViolationTransactionUtils,
    hasCustomUnitOutOfPolicyViolation as hasCustomUnitOutOfPolicyViolationTransactionUtils,
    isDistanceRequest,
    isExpensifyCardTransaction,
    isPending,
    isPerDiemRequest,
    isTransactionPendingDelete,
} from '@libs/TransactionUtils';
import {startMoneyRequest} from '@userActions/IOU';
import {getNavigationUrlOnMoneyRequestDelete} from '@userActions/IOU/DeleteMoneyRequest';
import {cancelPayment, payInvoice, payMoneyRequest} from '@userActions/IOU/PayMoneyRequest';
import {approveMoneyRequest, canApproveIOU, canIOUBePaid as canIOUBePaidAction, reopenReport, retractReport, unapproveExpenseReport} from '@userActions/IOU/ReportWorkflow';
import {setDeleteTransactionNavigateBackUrl} from '@userActions/Report';
import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';
=======
>>>>>>> origin/main
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import HeaderLoadingBar from './HeaderLoadingBar';
import HeaderWithBackButton from './HeaderWithBackButton';
import MoneyReportHeaderActions from './MoneyReportHeaderActions';
import MoneyReportHeaderModals from './MoneyReportHeaderModals';
import MoneyReportHeaderMoreContent from './MoneyReportHeaderMoreContent';
import {PaymentAnimationsProvider} from './PaymentAnimationsContext';
import {useSearchActionsContext} from './Search/SearchContext';

type MoneyReportHeaderProps = {
    /** The reportID of the report currently being looked at */
    reportID: string | undefined;

    /** Whether back button should be displayed in header */
    shouldDisplayBackButton?: boolean;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;
};

function MoneyReportHeader({reportID, shouldDisplayBackButton = false, onBackButtonPress}: MoneyReportHeaderProps) {
    return (
        <MoneyReportHeaderModals reportID={reportID}>
            <PaymentAnimationsProvider>
                <MoneyReportHeaderContent
                    reportID={reportID}
                    shouldDisplayBackButton={shouldDisplayBackButton}
                    onBackButtonPress={onBackButtonPress}
                />
            </PaymentAnimationsProvider>
        </MoneyReportHeaderModals>
    );
}

function MoneyReportHeaderContent({reportID: reportIDProp, shouldDisplayBackButton = false, onBackButtonPress}: MoneyReportHeaderProps) {
    const {clearSelectedTransactions} = useSearchActionsContext();
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDProp}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use a correct layout for the hold expense modal https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const shouldDisplayNarrowVersion = shouldUseNarrowLayout || isMediumScreenWidth;
    const route = useRoute<
        | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.EXPENSE_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
    >();
    const {isOffline} = useNetwork();

    const {translate} = useLocalize();

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);

    const transactions = Object.values(reportTransactions);

    const styles = useThemeStyles();

    const {isWideRHPDisplayedOnWideLayout, isSuperWideRHPDisplayedOnWideLayout} = useResponsiveLayoutOnWideRHP();

    const shouldDisplayNarrowMoreButton = !shouldDisplayNarrowVersion || isWideRHPDisplayedOnWideLayout || isSuperWideRHPDisplayedOnWideLayout;
    const isReportInRHP = route.name !== SCREENS.REPORT;
    const shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;
    const isReportInSearch = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT;
    // eslint-disable-next-line no-restricted-syntax -- backTo is a legacy route param, preserving existing behavior
    const backTo = (route.params as {backTo?: Route} | undefined)?.backTo;

<<<<<<< HEAD
    const existingB2BInvoiceReport = useParticipantsInvoiceReport(activePolicyID, CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, chatReport?.policyID);
    const isSelectionModePaymentRef = useRef(false);
    const confirmPayment = useCallback(
        ({paymentType: type, payAsBusiness, methodID, paymentMethod}: PaymentActionParams) => {
            if (!type || !chatReport) {
                return;
            }
            const isFromSelectionMode = isSelectionModePaymentRef.current;
            if (isDelegateAccessRestricted) {
                showDelegateNoAccessModal();
            } else if (isAnyTransactionOnHold) {
                openHoldMenu({
                    requestType: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                    paymentType: type,
                    methodID,
                    onConfirm: () => {
                        if (isFromSelectionMode) {
                            clearSelectedTransactions(true);
                            return;
                        }
                        startAnimation();
                    },
                }).then(() => {
                    isSelectionModePaymentRef.current = false;
                });
            } else if (isInvoiceReport) {
                if (!isFromSelectionMode) {
                    startAnimation();
                }
                payInvoice({
                    paymentMethodType: type,
                    chatReport,
                    invoiceReport: moneyRequestReport,
                    invoiceReportCurrentNextStepDeprecated: nextStep,
                    introSelected,
                    currentUserAccountIDParam: accountID,
                    currentUserEmailParam: email ?? '',
                    payAsBusiness,
                    existingB2BInvoiceReport,
                    methodID,
                    paymentMethod,
                    activePolicy,
                    betas,
                    isSelfTourViewed,
                });
                if (isFromSelectionMode) {
                    clearSelectedTransactions(true);
                }
            } else {
                if (!isFromSelectionMode) {
                    startAnimation();
                }
                payMoneyRequest({
                    paymentType: type,
                    chatReport,
                    iouReport: moneyRequestReport,
                    introSelected,
                    iouReportCurrentNextStepDeprecated: nextStep,
                    currentUserAccountID: accountID,
                    activePolicy,
                    policy,
                    betas,
                    isSelfTourViewed,
                    userBillingGracePeriodEnds,
                    amountOwed,
                    ownerBillingGracePeriodEnd,
                    methodID: type === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined,
                    onPaid: () => {
                        if (isFromSelectionMode) {
                            return;
                        }
                        startAnimation();
                    },
                });
                if (currentSearchQueryJSON && !isOffline) {
                    search({
                        searchKey: currentSearchKey,
                        shouldCalculateTotals,
                        offset: 0,
                        queryJSON: currentSearchQueryJSON,
                        isOffline,
                        isLoading: !!currentSearchResults?.search?.isLoading,
                    });
                }
                if (isFromSelectionMode) {
                    clearSelectedTransactions(true);
                }
            }
        },
        [
            chatReport,
            isDelegateAccessRestricted,
            isAnyTransactionOnHold,
            isInvoiceReport,
            showDelegateNoAccessModal,
            openHoldMenu,
            startAnimation,
            moneyRequestReport,
            nextStep,
            introSelected,
            accountID,
            email,
            existingB2BInvoiceReport,
            activePolicy,
            policy,
            currentSearchQueryJSON,
            isOffline,
            currentSearchKey,
            shouldCalculateTotals,
            currentSearchResults?.search?.isLoading,
            betas,
            isSelfTourViewed,
            userBillingGracePeriodEnds,
            clearSelectedTransactions,
            amountOwed,
            ownerBillingGracePeriodEnd,
        ],
    );

    useEffect(() => {
        if (selectedTransactionIDs.length !== 0) {
            return;
        }
        isSelectionModePaymentRef.current = false;
    }, [selectedTransactionIDs.length]);

    const confirmApproval = useCallback(
        (skipAnimation = false) => {
            if (isDelegateAccessRestricted) {
                showDelegateNoAccessModal();
            } else if (isAnyTransactionOnHold) {
                openHoldMenu({
                    requestType: CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
                    onConfirm: () => {
                        if (skipAnimation) {
                            clearSelectedTransactions(true);
                            return;
                        }
                        startApprovedAnimation();
                    },
                });
            } else {
                if (!skipAnimation) {
                    startApprovedAnimation();
                }
                approveMoneyRequest({
                    expenseReport: moneyRequestReport,
                    expenseReportPolicy: policy,
                    policy,
                    currentUserAccountIDParam: accountID,
                    currentUserEmailParam: email ?? '',
                    hasViolations,
                    isASAPSubmitBetaEnabled,
                    expenseReportCurrentNextStepDeprecated: nextStep,
                    betas,
                    userBillingGracePeriodEnds,
                    amountOwed,
                    ownerBillingGracePeriodEnd,
                    full: true,
                    onApproved: () => {
                        if (skipAnimation) {
                            return;
                        }
                        startApprovedAnimation();
                    },
                    delegateEmail,
                });
                if (skipAnimation) {
                    clearSelectedTransactions(true);
                }
            }
        },
        [
            policy,
            isDelegateAccessRestricted,
            showDelegateNoAccessModal,
            isAnyTransactionOnHold,
            openHoldMenu,
            startApprovedAnimation,
            moneyRequestReport,
            accountID,
            email,
            hasViolations,
            isASAPSubmitBetaEnabled,
            nextStep,
            betas,
            userBillingGracePeriodEnds,
            amountOwed,
            clearSelectedTransactions,
            ownerBillingGracePeriodEnd,
            delegateEmail,
        ],
    );

    const handleMarkPendingRTERTransactionsAsCash = useCallback(() => {
        markPendingRTERTransactionsAsCash(transactions, allTransactionViolations, reportActions);
    }, [transactions, allTransactionViolations, reportActions]);

    const confirmPendingRTERAndProceed = useConfirmPendingRTERAndProceed(hasAnyPendingRTERViolation, handleMarkPendingRTERTransactionsAsCash);

    const handleSubmitReport = useCallback(
        (skipAnimation = false) => {
            if (!moneyRequestReport || shouldBlockSubmit) {
                return;
            }

            const doSubmit = () => {
                Navigation.navigate(ROUTES.REPORT_SUBMIT_TO.getRoute(moneyRequestReport.reportID, Navigation.getActiveRoute()));
                if (skipAnimation) {
                    clearSelectedTransactions(true);
                }
            };
            confirmPendingRTERAndProceed(doSubmit);
        },
        [moneyRequestReport, shouldBlockSubmit, clearSelectedTransactions, confirmPendingRTERAndProceed],
    );

    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: passthroughPolicyTagListSelector});
    const targetPolicyTags = useMemo(
        () => (defaultExpensePolicy ? (allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${defaultExpensePolicy.id}`] ?? {}) : {}),
        [defaultExpensePolicy, allPolicyTags],
    );

    const duplicateExpenseTransaction = useCallback(
        (transactionList: OnyxTypes.Transaction[]) => {
            if (!transactionList.length) {
                return;
            }

            const optimisticChatReportID = generateReportID();
            const optimisticIOUReportID = generateReportID();
            const activePolicyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${defaultExpensePolicy?.id}`] ?? {};

            for (const item of transactionList) {
                const existingTransactionID = getExistingTransactionID(item.linkedTrackedExpenseReportAction);
                const existingTransactionDraft = existingTransactionID ? transactionDrafts?.[existingTransactionID] : undefined;

                duplicateTransactionAction({
                    transaction: item,
                    optimisticChatReportID,
                    optimisticIOUReportID,
                    isASAPSubmitBetaEnabled,
                    introSelected,
                    activePolicyID,
                    quickAction,
                    policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                    isSelfTourViewed,
                    customUnitPolicyID: policy?.id,
                    targetPolicy: defaultExpensePolicy ?? undefined,
                    targetPolicyCategories: activePolicyCategories,
                    targetReport: activePolicyExpenseChat,
                    existingTransactionDraft,
                    draftTransactionIDs,
                    betas,
                    personalDetails,
                    recentWaypoints,
                    targetPolicyTags,
                });
            }
        },
        [
            activePolicyExpenseChat,
            activePolicyID,
            allPolicyCategories,
            transactionDrafts,
            defaultExpensePolicy,
            draftTransactionIDs,
            introSelected,
            isASAPSubmitBetaEnabled,
            quickAction,
            policyRecentlyUsedCurrencies,
            policy?.id,
            isSelfTourViewed,
            betas,
            personalDetails,
            recentWaypoints,
            targetPolicyTags,
        ],
    );

    const primaryAction = useMemo(() => {
        return getReportPrimaryAction({
            currentUserLogin: currentUserLogin ?? '',
            currentUserAccountID: accountID,
            report: moneyRequestReport,
            chatReport,
            reportTransactions: nonPendingDeleteTransactions,
            violations,
            bankAccountList,
            policy,
            reportNameValuePairs,
            reportActions,
            reportMetadata,
            isChatReportArchived,
            invoiceReceiverPolicy,
            isPaidAnimationRunning,
            isApprovedAnimationRunning,
            isSubmittingAnimationRunning,
        });
    }, [
        isPaidAnimationRunning,
        isApprovedAnimationRunning,
        isSubmittingAnimationRunning,
        moneyRequestReport,
        chatReport,
        nonPendingDeleteTransactions,
        violations,
        policy,
        reportNameValuePairs,
        reportActions,
        reportMetadata,
        isChatReportArchived,
        invoiceReceiverPolicy,
        currentUserLogin,
        accountID,
        bankAccountList,
    ]);

    const getAmount = (actionType: ValueOf<typeof CONST.REPORT.REPORT_PREVIEW_ACTIONS>) => ({
        formattedAmount: getTotalAmountForIOUReportPreviewButton(moneyRequestReport, policy, actionType, nonPendingDeleteTransactions),
    });

    const {formattedAmount: totalAmount} = getAmount(CONST.REPORT.PRIMARY_ACTIONS.PAY);

    const paymentButtonOptions = usePaymentOptions({
        currency: moneyRequestReport?.currency,
        iouReport: moneyRequestReport,
        chatReportID: chatReport?.reportID,
        formattedAmount: totalAmount,
        policyID: moneyRequestReport?.policyID,
        onPress: confirmPayment,
        shouldHidePaymentOptions: !shouldShowPayButton,
        shouldShowApproveButton,
        shouldDisableApproveButton,
        onlyShowPayElsewhere,
    });

    const activeAdminPolicies = useActiveAdminPolicies();

    const workspacePolicyOptions = useMemo(() => {
        if (!isIOUReportUtil(moneyRequestReport)) {
            return [];
        }

        const hasPersonalPaymentOption = paymentButtonOptions.some((opt) => opt.value === CONST.IOU.PAYMENT_TYPE.EXPENSIFY);
        if (!hasPersonalPaymentOption || !activeAdminPolicies.length) {
            return [];
        }

        const canUseBusinessBankAccount = moneyRequestReport?.reportID && !hasRequestFromCurrentAccount(moneyRequestReport, accountID ?? CONST.DEFAULT_NUMBER_ID);
        if (!canUseBusinessBankAccount) {
            return [];
        }

        return sortPoliciesByName(activeAdminPolicies, localeCompare);
    }, [moneyRequestReport, paymentButtonOptions, activeAdminPolicies, accountID, localeCompare]);

    const buildPaymentSubMenuItems = useCallback(
        (onWorkspaceSelected: (workspacePolicy: OnyxTypes.Policy) => void): PopoverMenuItem[] => {
            if (!workspacePolicyOptions.length) {
                return Object.values(paymentButtonOptions);
            }

            const result: PopoverMenuItem[] = [];
            for (const opt of Object.values(paymentButtonOptions)) {
                result.push(opt);
                if (opt.value === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                    for (const wp of workspacePolicyOptions) {
                        result.push({
                            text: translate('iou.payWithPolicy', truncate(wp.name, {length: CONST.ADDITIONAL_ALLOWED_CHARACTERS}), ''),
                            icon: expensifyIcons.Building,
                            onSelected: () => onWorkspaceSelected(wp),
                        });
                    }
                }
            }

            return result;
        },
        [workspacePolicyOptions, paymentButtonOptions, translate, expensifyIcons.Building],
    );

    const addExpenseDropdownOptions = useMemo(
        () =>
            getAddExpenseDropdownOptions({
                translate,
                icons: expensifyIcons,
                iouReportID: moneyRequestReport?.reportID,
                policy,
                userBillingGracePeriodEnds,
                draftTransactionIDs,
                amountOwed,
                ownerBillingGracePeriodEnd,
                lastDistanceExpenseType,
            }),
        [moneyRequestReport?.reportID, policy, userBillingGracePeriodEnds, amountOwed, lastDistanceExpenseType, expensifyIcons, translate, ownerBillingGracePeriodEnd, draftTransactionIDs],
    );

    const exportSubmenuOptions: Record<string, DropdownOption<string>> = useMemo(() => {
        const options: Record<string, DropdownOption<string>> = {
            [CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV]: {
                text: translate('export.basicExport'),
                icon: expensifyIcons.Table,
                value: CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV,
                sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
                onSelected: () => {
                    if (!moneyRequestReport) {
                        return;
                    }
                    if (isOffline) {
                        showOfflineModal();
                        return;
                    }
                    exportReportToCSV(
                        {
                            reportID: moneyRequestReport.reportID,
                            transactionIDList: transactionIDs,
                        },
                        showDownloadErrorModal,
                        translate,
                    );
                },
            },
            [CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION]: {
                text: translate('workspace.common.exportIntegrationSelected', {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    connectionName: connectedIntegrationFallback!,
                }),
                icon: (() => {
                    return getIntegrationIcon(connectedIntegration ?? connectedIntegrationFallback, expensifyIcons);
                })(),
                displayInDefaultIconColor: true,
                additionalIconStyles: styles.integrationIcon,
                value: CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION,
                sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
                onSelected: () => {
                    if (!connectedIntegration || !moneyRequestReport) {
                        return;
                    }
                    if (isExported) {
                        triggerExportOrConfirm(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION);
                        return;
                    }
                    exportToIntegration(moneyRequestReport?.reportID, connectedIntegration);
                },
            },
            [CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED]: {
                text: translate('workspace.common.markAsExported'),
                icon: (() => {
                    return getIntegrationIcon(connectedIntegration ?? connectedIntegrationFallback, expensifyIcons);
                })(),
                additionalIconStyles: styles.integrationIcon,
                displayInDefaultIconColor: true,
                value: CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED,
                sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
                onSelected: () => {
                    if (!connectedIntegration || !moneyRequestReport) {
                        return;
                    }
                    if (isExported) {
                        triggerExportOrConfirm(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED);
                        return;
                    }
                    markAsManuallyExported([moneyRequestReport?.reportID ?? CONST.DEFAULT_NUMBER_ID], connectedIntegration);
                },
            },
        };

        for (const template of exportTemplates) {
            options[template.name] = {
                text: template.name,
                icon: expensifyIcons.Table,
                value: template.templateName,
                description: template.description,
                sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
                onSelected: () => beginExportWithTemplate(template.templateName, template.type, transactionIDs, template.policyID),
            };
        }

        return options;
    }, [
        translate,
        expensifyIcons,
        connectedIntegrationFallback,
        styles.integrationIcon,
        moneyRequestReport,
        isOffline,
        transactionIDs,
        connectedIntegration,
        isExported,
        exportTemplates,
        beginExportWithTemplate,
        triggerExportOrConfirm,
        showOfflineModal,
        showDownloadErrorModal,
    ]);

    const primaryActionComponent = (
        <MoneyReportHeaderPrimaryAction
            reportID={reportIDProp}
            chatReportID={chatReport?.reportID}
            primaryAction={primaryAction}
            isPaidAnimationRunning={isPaidAnimationRunning}
            isApprovedAnimationRunning={isApprovedAnimationRunning}
            isSubmittingAnimationRunning={isSubmittingAnimationRunning}
            stopAnimation={stopAnimation}
            startAnimation={startAnimation}
            startApprovedAnimation={startApprovedAnimation}
            startSubmittingAnimation={startSubmittingAnimation}
            onExportModalOpen={() => triggerExportOrConfirm(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION)}
        />
    );

    const secondaryActions = useMemo(() => {
        if (!moneyRequestReport) {
            return [];
        }
        return getSecondaryReportActions({
            currentUserLogin: currentUserLogin ?? '',
            currentUserAccountID: accountID,
            report: moneyRequestReport,
            chatReport,
            reportTransactions: nonPendingDeleteTransactions,
            originalTransaction: originalIOUTransaction,
            violations,
            bankAccountList,
            policy,
            reportNameValuePairs,
            reportActions,
            reportMetadata,
            policies,
            outstandingReportsByPolicyID,
            isChatReportArchived,
        });
    }, [
        moneyRequestReport,
        currentUserLogin,
        accountID,
        chatReport,
        nonPendingDeleteTransactions,
        originalIOUTransaction,
        violations,
        policy,
        reportNameValuePairs,
        reportActions,
        reportMetadata,
        policies,
        isChatReportArchived,
        bankAccountList,
        outstandingReportsByPolicyID,
    ]);

    const secondaryExportActions = useMemo(() => {
        if (!moneyRequestReport) {
            return [];
        }
        return getSecondaryExportReportActions(accountID, email ?? '', moneyRequestReport, bankAccountList, policy, exportTemplates);
    }, [moneyRequestReport, accountID, email, policy, exportTemplates, bankAccountList]);

    const hasSubmitAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.SUBMIT || secondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT);
    const hasApproveAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.APPROVE || secondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE);
    const hasPayAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.PAY || secondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.PAY);

    const checkForNecessaryAction = useCallback(
        (paymentMethodType?: PaymentMethodType) => {
            if (isDelegateAccessRestricted) {
                showDelegateNoAccessModal();
                return true;
            }
            if (isAccountLocked) {
                showLockedAccountModal();
                return true;
            }
            if (!isUserValidated && paymentMethodType !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
                handleUnvalidatedAccount(moneyRequestReport);
                return true;
            }

            return false;
        },
        [isDelegateAccessRestricted, showDelegateNoAccessModal, isAccountLocked, showLockedAccountModal, isUserValidated, moneyRequestReport],
    );

    const selectionModeReportLevelActions = useMemo(() => {
        if (!isBulkSubmitApprovePayBetaEnabled) {
            return [];
        }
        const actions: Array<DropdownOption<string> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon'>> = [];
        if (hasSubmitAction && !shouldBlockSubmit) {
            actions.push({
                text: translate('common.submit'),
                icon: expensifyIcons.Send,
                value: CONST.REPORT.PRIMARY_ACTIONS.SUBMIT,
                onSelected: () => handleSubmitReport(true),
            });
        }
        if (hasApproveAction && !isBlockSubmitDueToPreventSelfApproval) {
            actions.push({
                text: translate('iou.approve'),
                icon: expensifyIcons.ThumbsUp,
                value: CONST.REPORT.PRIMARY_ACTIONS.APPROVE,
                onSelected: () => {
                    isSelectionModePaymentRef.current = true;
                    confirmApproval(true);
                },
            });
        }
        if (hasPayAction && !(isOffline && !canAllowSettlement)) {
            actions.push({
                text: translate('iou.settlePayment', totalAmount),
                icon: expensifyIcons.Cash,
                value: CONST.REPORT.PRIMARY_ACTIONS.PAY,
                rightIcon: expensifyIcons.ArrowRight,
                backButtonText: translate('iou.settlePayment', totalAmount),
                subMenuItems: buildPaymentSubMenuItems((wp) => {
                    isSelectionModePaymentRef.current = true;
                    if (checkForNecessaryAction()) {
                        return;
                    }
                    kycWallRef.current?.continueAction?.({policy: wp});
                }),
                onSelected: () => {
                    isSelectionModePaymentRef.current = true;
                },
            });
        }
        return actions;
    }, [
        isBulkSubmitApprovePayBetaEnabled,
        hasSubmitAction,
        shouldBlockSubmit,
        hasApproveAction,
        isBlockSubmitDueToPreventSelfApproval,
        hasPayAction,
        isOffline,
        canAllowSettlement,
        translate,
        handleSubmitReport,
        confirmApproval,
        totalAmount,
        buildPaymentSubMenuItems,
        checkForNecessaryAction,
        expensifyIcons.ArrowRight,
        expensifyIcons.Cash,
        expensifyIcons.Send,
        expensifyIcons.ThumbsUp,
        kycWallRef,
    ]);

    const connectedIntegrationName = connectedIntegration
        ? translate('workspace.accounting.connectionName', {
              connectionName: connectedIntegration,
          })
        : '';
    const unapproveWarningText = useMemo(
        () => (
            <Text>
                <Text style={[styles.textStrong, styles.noWrap]}>{translate('iou.headsUp')}</Text> <Text>{translate('iou.unapproveWithIntegrationWarning', connectedIntegrationName)}</Text>
            </Text>
        ),
        [connectedIntegrationName, styles.noWrap, styles.textStrong, translate],
    );

    const reopenExportedReportWarningText = (
        <Text>
            <Text style={[styles.textStrong, styles.noWrap]}>{translate('iou.headsUp')} </Text>
            <Text>
                {translate('iou.reopenExportedReportConfirmation', {
                    connectionName: integrationNameFromExportMessage ?? '',
                })}
            </Text>
        </Text>
    );

    const secondaryActionsImplementation: Record<
        ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>,
        DropdownOption<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon'>
    > = {
        [CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS,
            text: translate('iou.viewDetails'),
            icon: expensifyIcons.Info,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.VIEW_DETAILS,
            onSelected: () => {
                navigateToDetailsPage(moneyRequestReport, Navigation.getReportRHPActiveRoute());
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.EXPORT]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.EXPORT,
            text: translate('common.export'),
            backButtonText: translate('common.export'),
            icon: expensifyIcons.Export,
            rightIcon: expensifyIcons.ArrowRight,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT,
            subMenuItems: secondaryExportActions.map((action) => exportSubmenuOptions[action as string]),
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF,
            text: translate('common.downloadAsPDF'),
            icon: expensifyIcons.Download,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.DOWNLOAD_PDF,
            onSelected: () => {
                if (!moneyRequestReport?.reportID) {
                    return;
                }
                openPDFDownload();
                exportReportToPDF({reportID: moneyRequestReport.reportID});
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.PRINT]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.PRINT,
            text: translate('common.print'),
            icon: expensifyIcons.Printer,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.PRINT,
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }
                openOldDotLink(CONST.OLDDOT_URLS.PRINTABLE_REPORT(moneyRequestReport.reportID));
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.SUBMIT]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.SUBMIT,
            text: translate('common.submit'),
            icon: expensifyIcons.Send,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.SUBMIT,
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }

                confirmPendingRTERAndProceed(() => {
                    Navigation.navigate(ROUTES.REPORT_SUBMIT_TO.getRoute(moneyRequestReport.reportID, Navigation.getActiveRoute()));
                });
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.APPROVE]: {
            text: translate('iou.approve'),
            icon: expensifyIcons.ThumbsUp,
            value: CONST.REPORT.SECONDARY_ACTIONS.APPROVE,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.APPROVE,
            onSelected: confirmApproval,
        },
        [CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE]: {
            text: translate('iou.unapprove'),
            icon: expensifyIcons.CircularArrowBackwards,
            value: CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.UNAPPROVE,
            onSelected: async () => {
                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                if (isExported) {
                    const result = await showConfirmModal({
                        title: translate('iou.unapproveReport'),
                        prompt: unapproveWarningText,
                        confirmText: translate('iou.unapproveReport'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    });

                    if (result.action !== ModalActions.CONFIRM) {
                        return;
                    }
                    unapproveExpenseReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, delegateEmail);
                    return;
                }

                unapproveExpenseReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, delegateEmail);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT]: {
            text: translate('iou.cancelPayment'),
            icon: expensifyIcons.Clear,
            value: CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.CANCEL_PAYMENT,
            onSelected: async () => {
                const result = await showConfirmModal({
                    title: translate('iou.cancelPayment'),
                    prompt: translate('iou.cancelPaymentConfirmation'),
                    confirmText: translate('iou.cancelPayment'),
                    cancelText: translate('common.dismiss'),
                    danger: true,
                });

                if (result.action !== ModalActions.CONFIRM || !chatReport) {
                    return;
                }
                cancelPayment(moneyRequestReport, chatReport, policy, isASAPSubmitBetaEnabled, accountID, email ?? '', hasViolations);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.HOLD]: {
            text: translate('iou.hold'),
            icon: expensifyIcons.Stopwatch,
            value: CONST.REPORT.SECONDARY_ACTIONS.HOLD,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.HOLD,
            onSelected: () => {
                if (!requestParentReportAction) {
                    throw new Error('Parent action does not exist');
                }

                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                const isDismissed = isReportSubmitter ? dismissedHoldUseExplanation : dismissedRejectUseExplanation;

                if (isDismissed || isChatReportDM) {
                    changeMoneyRequestHoldStatus(requestParentReportAction, transaction, isOffline);
                } else if (isReportSubmitter) {
                    openHoldEducational();
                } else {
                    openRejectModal(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD);
                }
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD]: {
            text: translate('iou.unhold'),
            icon: expensifyIcons.Stopwatch,
            value: CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.REMOVE_HOLD,
            onSelected: () => {
                if (!requestParentReportAction) {
                    throw new Error('Parent action does not exist');
                }

                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                changeMoneyRequestHoldStatus(requestParentReportAction, transaction, isOffline);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.SPLIT]: {
            text: shouldShowSplitIndicator ? translate('iou.editSplits') : translate('iou.split'),
            icon: expensifyIcons.ArrowSplit,
            value: CONST.REPORT.SECONDARY_ACTIONS.SPLIT,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.SPLIT,
            onSelected: () => {
                if (Number(transactions?.length) !== 1) {
                    return;
                }

                initSplitExpense(currentTransaction, policy);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.MERGE]: {
            text: translate('common.merge'),
            icon: expensifyIcons.ArrowCollapse,
            value: CONST.REPORT.SECONDARY_ACTIONS.MERGE,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.MERGE,
            onSelected: () => {
                if (!currentTransaction) {
                    return;
                }

                setupMergeTransactionDataAndNavigate(currentTransaction.transactionID, [currentTransaction], localeCompare, getCurrencyDecimals);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_EXPENSE]: {
            text: isDuplicateActive ? translate('common.duplicateExpense') : translate('common.duplicated'),
            icon: isDuplicateActive ? expensifyIcons.ExpenseCopy : expensifyIcons.Checkmark,
            iconFill: isDuplicateActive ? undefined : theme.icon,
            value: CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_EXPENSE,
            onSelected: () => {
                if (hasCustomUnitOutOfPolicyViolation) {
                    showConfirmModal({
                        title: translate('common.duplicateExpense'),
                        prompt: translate('iou.correctRateError'),
                        confirmText: translate('common.buttonConfirm'),
                        shouldShowCancelButton: false,
                    });
                    return;
                }

                if (isDistanceExpenseUnsupportedForDuplicating) {
                    showConfirmModal({
                        title: translate('common.duplicateExpense'),
                        prompt: translate('iou.cannotDuplicateDistanceExpense'),
                        confirmText: translate('common.buttonConfirm'),
                        shouldShowCancelButton: false,
                    });
                    return;
                }

                if (isPerDiemRequestOnNonDefaultWorkspace) {
                    showConfirmModal({
                        title: translate('common.duplicateExpense'),
                        prompt: translate('iou.duplicateNonDefaultWorkspacePerDiemError'),
                        confirmText: translate('common.buttonConfirm'),
                        shouldShowCancelButton: false,
                    });
                    return;
                }

                if (!isDuplicateActive || !transaction) {
                    return;
                }

                temporarilyDisableDuplicateAction();

                duplicateExpenseTransaction([transaction]);
            },
            shouldCloseModalOnSelect: shouldDuplicateCloseModalOnSelect,
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_REPORT]: {
            text: isDuplicateReportActive ? translate('common.duplicateReport') : translate('common.duplicated'),
            icon: isDuplicateReportActive ? expensifyIcons.ReportCopy : expensifyIcons.Checkmark,
            iconFill: isDuplicateReportActive ? undefined : theme.icon,
            value: CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_REPORT,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.DUPLICATE_REPORT,
            shouldShow: !!defaultExpensePolicy,
            shouldCloseModalOnSelect: false,
            onSelected: () => {
                if (!isDuplicateReportActive) {
                    return;
                }

                temporarilyDisableDuplicateReportAction();
                wasDuplicateReportTriggered.current = true;

                const isSourcePolicyValid = !!policy && isPolicyAccessible(policy, currentUserLogin ?? '');
                const targetPolicyForDuplicate = isSourcePolicyValid ? policy : defaultExpensePolicy;
                const targetChatForDuplicate = isSourcePolicyValid ? chatReport : activePolicyExpenseChat;
                const activePolicyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${targetPolicyForDuplicate?.id}`] ?? {};

                // eslint-disable-next-line @typescript-eslint/no-deprecated
                InteractionManager.runAfterInteractions(() => {
                    duplicateReportAction({
                        sourceReport: moneyRequestReport,
                        sourceReportTransactions: nonPendingDeleteTransactions,
                        sourceReportName: moneyRequestReport?.reportName ?? '',
                        targetPolicy: targetPolicyForDuplicate ?? undefined,
                        targetPolicyCategories: activePolicyCategories,
                        targetPolicyTags: allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${targetPolicyForDuplicate?.id}`] ?? {},
                        parentChatReport: targetChatForDuplicate,
                        ownerPersonalDetails: currentUserPersonalDetails,
                        isASAPSubmitBetaEnabled,
                        betas,
                        personalDetails,
                        quickAction,
                        policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                        draftTransactionIDs,
                        isSelfTourViewed,
                        transactionViolations: allTransactionViolations,
                        translate,
                        recentWaypoints: recentWaypoints ?? [],
                    });
                });
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE]: {
            text: translate('iou.changeWorkspace'),
            icon: expensifyIcons.Buildings,
            value: CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.CHANGE_WORKSPACE,
            shouldShow: transactions.length === 0 || nonPendingDeleteTransactions.length > 0,
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }
                Navigation.navigate(ROUTES.REPORT_WITH_ID_CHANGE_WORKSPACE.getRoute(moneyRequestReport.reportID, Navigation.getActiveRoute()));
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.MOVE_EXPENSE]: {
            text: translate('iou.moveExpenses'),
            icon: expensifyIcons.DocumentMerge,
            value: CONST.REPORT.SECONDARY_ACTIONS.MOVE_EXPENSE,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.MOVE_EXPENSE,
            shouldShow: canMoveSingleExpense,
            onSelected: () => {
                if (!moneyRequestReport || nonPendingDeleteTransactions.length !== 1) {
                    return;
                }
                const transactionToMove = nonPendingDeleteTransactions.at(0);
                if (!transactionToMove?.transactionID) {
                    return;
                }
                Navigation.navigate(
                    ROUTES.MONEY_REQUEST_EDIT_REPORT.getRoute(
                        CONST.IOU.ACTION.EDIT,
                        CONST.IOU.TYPE.SUBMIT,
                        moneyRequestReport.reportID,
                        true,
                        Navigation.getActiveRoute(),
                        transactionToMove.transactionID,
                    ),
                );
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.CHANGE_APPROVER]: {
            text: translate('iou.changeApprover.title'),
            icon: expensifyIcons.Workflows,
            value: CONST.REPORT.SECONDARY_ACTIONS.CHANGE_APPROVER,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.CHANGE_APPROVER,
            onSelected: () => {
                if (!moneyRequestReport) {
                    Log.warn('Change approver secondary action triggered without moneyRequestReport data.');
                    return;
                }
                Navigation.navigate(ROUTES.REPORT_CHANGE_APPROVER.getRoute(moneyRequestReport.reportID, Navigation.getActiveRoute()));
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DELETE]: {
            text: translate('common.delete'),
            icon: expensifyIcons.Trashcan,
            value: CONST.REPORT.SECONDARY_ACTIONS.DELETE,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.DELETE,
            onSelected: async () => {
                const transactionCount = Object.keys(transactions).length;

                if (transactionCount === 1) {
                    const result = await showConfirmModal({
                        title: translate('iou.deleteExpense', {count: 1}),
                        prompt: translate('iou.deleteConfirmation', {count: 1}),
                        confirmText: translate('common.delete'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    });

                    if (result.action !== ModalActions.CONFIRM) {
                        return;
                    }
                    if (transactionThreadReportID) {
                        if (!requestParentReportAction || !transaction?.transactionID) {
                            throw new Error('Missing data!');
                        }
                        const goBackRoute = getNavigationUrlOnMoneyRequestDelete(
                            transaction.transactionID,
                            requestParentReportAction,
                            iouReport,
                            chatIOUReport,
                            isChatIOUReportArchived,
                            false,
                        );
                        const deleteNavigateBackUrl = goBackRoute ?? route.params?.backTo ?? Navigation.getActiveRoute();
                        setDeleteTransactionNavigateBackUrl(deleteNavigateBackUrl);
                        if (goBackRoute) {
                            navigateOnDeleteExpense(goBackRoute);
                        }
                        // it's deleting transaction but not the report which leads to bug (that is actually also on staging)
                        // Money request should be deleted when interactions are done, to not show the not found page before navigating to goBackRoute
                        // eslint-disable-next-line @typescript-eslint/no-deprecated
                        InteractionManager.runAfterInteractions(() => {
                            deleteTransactions([transaction.transactionID], duplicateTransactions, duplicateTransactionViolations, isReportInSearch ? currentSearchHash : undefined, false);
                            removeTransaction(transaction.transactionID);
                        });
                    }
                    return;
                }

                const result = await showConfirmModal({
                    title: translate('iou.deleteReport', {count: 1}),
                    prompt: translate('iou.deleteReportConfirmation', {count: 1}),
                    confirmText: translate('common.delete'),
                    cancelText: translate('common.cancel'),
                    danger: true,
                });
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
                const backToRoute = route.params?.backTo ?? (chatReport?.reportID ? ROUTES.REPORT_WITH_ID.getRoute(chatReport.reportID) : undefined);
                const deleteNavigateBackUrl = backToRoute ?? Navigation.getActiveRoute();
                setDeleteTransactionNavigateBackUrl(deleteNavigateBackUrl);

                Navigation.setNavigationActionToMicrotaskQueue(() => {
                    Navigation.goBack(backToRoute);
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    InteractionManager.runAfterInteractions(() => {
                        deleteAppReport({
                            report: moneyRequestReport,
                            selfDMReport,
                            currentUserEmailParam: email ?? '',
                            currentUserAccountIDParam: accountID,
                            reportTransactions,
                            allTransactionViolations,
                            bankAccountList,
                            hash: currentSearchHash,
                        });
                    });
                });
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.RETRACT]: {
            text: translate('iou.retract'),
            icon: expensifyIcons.CircularArrowBackwards,
            value: CONST.REPORT.SECONDARY_ACTIONS.RETRACT,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.RETRACT,
            onSelected: async () => {
                if (isExported) {
                    const result = await showConfirmModal({
                        title: translate('iou.reopenReport'),
                        prompt: reopenExportedReportWarningText,
                        confirmText: translate('iou.reopenReport'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    });

                    if (result.action !== ModalActions.CONFIRM) {
                        return;
                    }
                    retractReport(moneyRequestReport, chatReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, delegateEmail);
                    return;
                }
                retractReport(moneyRequestReport, chatReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, delegateEmail);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.REOPEN]: {
            text: translate('iou.retract'),
            icon: expensifyIcons.CircularArrowBackwards,
            value: CONST.REPORT.SECONDARY_ACTIONS.REOPEN,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.REOPEN,
            onSelected: async () => {
                if (isExported) {
                    const result = await showConfirmModal({
                        title: translate('iou.reopenReport'),
                        prompt: reopenExportedReportWarningText,
                        confirmText: translate('iou.reopenReport'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    });

                    if (result.action !== ModalActions.CONFIRM) {
                        return;
                    }
                    reopenReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, chatReport);
                    return;
                }
                reopenReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, chatReport);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.REJECT]: {
            text: translate('common.reject'),
            icon: expensifyIcons.ThumbsDown,
            value: CONST.REPORT.SECONDARY_ACTIONS.REJECT,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.REJECT,
            onSelected: () => {
                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                if (moneyRequestReport?.reportID) {
                    Navigation.navigate(ROUTES.REJECT_EXPENSE_REPORT.getRoute(moneyRequestReport.reportID));
                }
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE]: {
            text: translate('iou.addExpense'),
            backButtonText: translate('iou.addExpense'),
            icon: expensifyIcons.Plus,
            rightIcon: expensifyIcons.ArrowRight,
            value: CONST.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.ADD_EXPENSE,
            subMenuItems: addExpenseDropdownOptions,
            onSelected: () => {
                if (!moneyRequestReport?.reportID) {
                    return;
                }
                if (policy && shouldRestrictUserBillableActions(policy.id, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, policy)) {
                    Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                    return;
                }
                startMoneyRequest(CONST.IOU.TYPE.SUBMIT, moneyRequestReport?.reportID, draftTransactionIDs);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.PAY]: {
            text: translate('iou.settlePayment', totalAmount),
            icon: expensifyIcons.Cash,
            rightIcon: expensifyIcons.ArrowRight,
            value: CONST.REPORT.SECONDARY_ACTIONS.PAY,
            backButtonText: translate('iou.settlePayment', totalAmount),
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.PAY,
            subMenuItems: buildPaymentSubMenuItems((wp) => {
                kycWallRef.current?.continueAction?.({policy: wp});
            }),
        },
    };
    const applicableSecondaryActions = secondaryActions
        .map((action) => secondaryActionsImplementation[action])
        .filter((action) => action?.shouldShow !== false && action?.value !== primaryAction);
    useEffect(() => {
        if (!transactionThreadReportID) {
            return;
        }
        clearSelectedTransactions(true);
        // We don't need to run the effect on change of clearSelectedTransactions since it can cause the infinite loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionThreadReportID]);
=======
    const primaryAction = useReportPrimaryAction(reportIDProp);
>>>>>>> origin/main

    const shouldShowBackButton = shouldDisplayBackButton || shouldUseNarrowLayout;

    const isMobileSelectionModeEnabled = useMobileSelectionMode();

    useEffect(() => {
        return () => {
            turnOffMobileSelectionMode();
        };
    }, []);

    if (isMobileSelectionModeEnabled && shouldUseNarrowLayout) {
        // If mobile selection mode is enabled but only one or no transactions remain, turn it off
        const visibleTransactions = transactions.filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);
        if (visibleTransactions.length <= 1) {
            turnOffMobileSelectionMode();
        }

        return (
            <HeaderWithBackButton
                title={translate('common.selectMultiple')}
                onBackButtonPress={() => {
                    clearSelectedTransactions(true);
                    turnOffMobileSelectionMode();
                }}
            />
        );
    }

    return (
        <View style={[styles.pt0, styles.borderBottom]}>
            <HeaderWithBackButton
                shouldShowReportAvatarWithDisplay
                shouldDisplayStatus
                shouldShowPinButton={false}
                report={moneyRequestReport}
                policy={policy}
                shouldShowBackButton={shouldShowBackButton}
                shouldDisplaySearchRouter={shouldDisplaySearchRouter}
                shouldDisplayHelpButton={!(isReportInRHP && shouldUseNarrowLayout)}
                onBackButtonPress={onBackButtonPress}
                shouldShowBorderBottom={false}
                shouldEnableDetailPageNavigation
                openParentReportInCurrentTab
            >
                {shouldDisplayNarrowMoreButton && (
                    <MoneyReportHeaderActions
                        reportID={reportIDProp}
                        primaryAction={primaryAction}
                        isReportInSearch={isReportInSearch}
                        backTo={backTo}
                    />
                )}
            </HeaderWithBackButton>
            {!shouldDisplayNarrowMoreButton && (
                <MoneyReportHeaderActions
                    reportID={reportIDProp}
                    primaryAction={primaryAction}
                    isReportInSearch={isReportInSearch}
                    backTo={backTo}
                />
            )}
            <MoneyReportHeaderMoreContent reportID={reportIDProp} />
            <HeaderLoadingBar />
        </View>
    );
}

export default MoneyReportHeader;
