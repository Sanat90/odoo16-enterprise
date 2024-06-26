/** @odoo-module */

import { AbstractBehavior } from "@knowledge/components/behaviors/abstract_behavior/abstract_behavior";
import { EmbeddedViewManager } from "@knowledge/components/behaviors/embedded_view_behavior/embedded_view_manager";
import { makeContext } from "@web/core/context";
import {
    decodeDataBehaviorProps,
    encodeDataBehaviorProps,
    setIntersectionObserver
} from "@knowledge/js/knowledge_utils";
import { useService } from "@web/core/utils/hooks";
import { uuid } from "@web/views/utils";

const {
    onError,
    onMounted,
    onWillUnmount,
    useState,
    useSubEnv } = owl;

/**
 * This component will have the responsibility to load the embedded view lazily
 * when it becomes visible on screen. The component will also have the responsibility
 * to handle errors that may occur when loading an embedded view.
 */
export class EmbeddedViewBehavior extends AbstractBehavior {
    setup () {
        super.setup();
        this.actionService = useService('action');
        this.state = useState({
            waiting: true,
            error: false
        });

        let embeddedViewId = this.props.embedded_view_id;
        if (!embeddedViewId) {
            embeddedViewId = uuid();
            const { anchor } = this.props;
            anchor.dataset.behaviorProps = encodeDataBehaviorProps(Object.assign(
                decodeDataBehaviorProps(anchor.dataset.behaviorProps),
                { embedded_view_id: embeddedViewId }
            ));
        }

        this.knowledgeEmbeddedViewId = embeddedViewId;            
        useSubEnv({
            knowledgeArticleUserCanWrite: this.props.record.data.user_can_write,
        });

        onMounted(() => {
            const { anchor } = this.props;
            this.observer = setIntersectionObserver(anchor, async () => {
                await this.loadData();
                this.state.waiting = false;
            });
            /**
             * Capturing the events occuring in the embedded view to prevent the
             * default behavior of the editor.
             * The event is cloned and dispatched again above the editable.
             * This essentially "skips" the editor listener and propagates the event above it.
             */
            const bypassEditorEventListeners = event => {
                const parent = this.props.root && this.props.root.parentElement;
                event.stopPropagation();
                if (parent) {
                    const clonedEvent = new event.constructor(event.type, event);
                    parent.dispatchEvent(clonedEvent);
                }
            };
            anchor.addEventListener('keydown', bypassEditorEventListeners);
            anchor.addEventListener('keyup', bypassEditorEventListeners); // power box
            anchor.addEventListener('input', bypassEditorEventListeners);
            anchor.addEventListener('beforeinput', bypassEditorEventListeners);
            anchor.addEventListener('paste', bypassEditorEventListeners);
            anchor.addEventListener('drop', bypassEditorEventListeners);
        });

        onWillUnmount(() => {
            if (this.observer) {
                this.observer.unobserve(this.props.anchor);
            }
        });

        onError(error => {
            console.error(error);
            this.state.error = true;
        });
    }

    async loadData () {
        const context = makeContext([this.props.context, {
            knowledgeEmbeddedViewId: this.knowledgeEmbeddedViewId
        }]);
        try {
            const action = await this.actionService.loadAction(
                this.props.act_window,
                context
            );
            if (action.type !== "ir.actions.act_window") {
                this.state.error = true;
                return;
            }
            if (this.props.display_name) {
                action.name = this.props.display_name;
            }
            if (this.props.action_help) {
                action.help = this.props.action_help;
            }
            this.embeddedViewManagerProps = {
                el: this.props.anchor,
                action,
                context,
                viewType: this.props.view_type,
                setTitle: this.setTitle.bind(this),
                getTitle: this.getTitle.bind(this),
                readonly: this.props.readonly,
            };
        } catch {
            this.state.error = true;
        }
    }

    /**
     * Set the title of the embedded view.
     * @param {String} name
     */
    setTitle (name) {
        const behaviorProps = decodeDataBehaviorProps(this.props.anchor.getAttribute('data-behavior-props'));
        if (behaviorProps.act_window) {
            behaviorProps.act_window.name = name;
            behaviorProps.act_window.display_name = name;
        }
        this.props.anchor.dataset.behaviorProps = encodeDataBehaviorProps(behaviorProps);
        this.embeddedViewManagerProps.action.name = name;
        const title = this.props.anchor.querySelector('.o_control_panel .breadcrumb-item.active');
        if (title) {
            title.textContent = name;
        }
    }

    /**
     * Get the title of the embedded view.
     * @returns {String}
     */
    getTitle () {
        return this.embeddedViewManagerProps.action.name || '';
    }
}

EmbeddedViewBehavior.template = "knowledge.EmbeddedViewBehavior";
EmbeddedViewBehavior.components = {
    EmbeddedViewManager,
};
EmbeddedViewBehavior.props = {
    ...AbstractBehavior.props,
    embedded_view_id: { type: String, optional: true },
    act_window: { type: Object },
    context: { type: Object },
    view_type: { type: String },
    action_help: { type: Object, optional: true},
};
