/*
 * Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the terms of the LICENSE file distributed with this project.
 */

import classNames from "classnames";
import * as React from "react";

import { Boundary } from "../../common/boundary";
import * as Classes from "../../common/classes";
import { Position } from "../../common/position";
import { IProps } from "../../common/props";
import { Menu } from "../menu/menu";
import { MenuItem } from "../menu/menuItem";
import { IOverflowListProps, OverflowList } from "../overflow-list/overflowList";
import { IPopoverProps, Popover } from "../popover/popover";
import { Breadcrumb, IBreadcrumbProps } from "./breadcrumb";

export interface IBreadcrumbsProps extends IProps {
    /**
     * Callback invoked to render visible breadcrumbs. If
     * `currentBreadcrumbRenderer` is also supplied, that callback will be used
     * for the current breadcrumb instead.
     *
     * If this callback is not supplied, a `Breadcrumb` will be rendered.
     */
    breadcrumbRenderer?: (props: IBreadcrumbProps) => JSX.Element;

    /**
     * Which direction the breadcrumbs should collapse from: start or end.
     * @default Boundary.START
     */
    collapseFrom?: Boundary;

    /**
     * Callback invoked to render the current breadcrumb, which is the last
     * element in the `items` array.
     *
     * If this prop is omitted, `breadcrumbRenderer` will be
     * invoked for the current breadcrumb instead.
     */
    currentBreadcrumbRenderer?: (props: IBreadcrumbProps) => JSX.Element;

    /**
     * All breadcrumbs to display. Breadcrumbs that do not fit in the container
     * will be rendered in an overflow menu instead.
     */
    items: IBreadcrumbProps[];

    /**
     * The number of visible breadcrumbs will never be lower than the number
     * passed to this prop.
     * @default 0
     */
    minVisibleItems?: number;

    /**
     * Props to spread to `OverflowList`. Note that `items`,
     * `overflowRenderer`, and `visibleItemRenderer` cannot be changed.
     */
    overflowListProps?: Partial<IOverflowListProps<IBreadcrumbProps>>;

    /**
     * Props to spread to the `Popover` showing the overflow menu.
     */
    popoverProps?: IPopoverProps;
}

export class Breadcrumbs extends React.PureComponent<IBreadcrumbsProps> {
    public static defaultProps: Partial<IBreadcrumbsProps> = {
        collapseFrom: Boundary.START,
    };

    public render() {
        const { className, collapseFrom, items, minVisibleItems, overflowListProps = {} } = this.props;
        return (
            <OverflowList
                collapseFrom={collapseFrom}
                minVisibleItems={minVisibleItems}
                tagName="ul"
                {...overflowListProps}
                className={classNames(Classes.BREADCRUMBS, overflowListProps.className, className)}
                items={items}
                overflowRenderer={this.renderOverflow}
                visibleItemRenderer={this.renderBreadcrumbWrapper}
            />
        );
    }

    private renderOverflow = (items: IBreadcrumbProps[]) => {
        const { collapseFrom } = this.props;
        const position = collapseFrom === Boundary.END ? Position.BOTTOM_RIGHT : Position.BOTTOM_LEFT;
        let orderedItems = items;
        if (collapseFrom === Boundary.START) {
            orderedItems = items.slice().reverse();
        }
        return (
            <li>
                <Popover position={position} {...this.props.popoverProps}>
                    <span className={Classes.BREADCRUMBS_COLLAPSED} />
                    <Menu>{orderedItems.map(this.renderOverflowBreadcrumb)}</Menu>
                </Popover>
            </li>
        );
    };

    private renderOverflowBreadcrumb = (props: IBreadcrumbProps, index: number) => {
        const isClickable = props.href != null || props.onClick != null;
        return <MenuItem disabled={!isClickable} {...props} text={props.text} key={index} />;
    };

    private renderBreadcrumbWrapper = (props: IBreadcrumbProps, index: number) => {
        const isCurrent = this.props.items[this.props.items.length - 1] === props;
        return <li key={index}>{this.renderBreadcrumb(props, isCurrent)}</li>;
    };

    private renderBreadcrumb(props: IBreadcrumbProps, isCurrent: boolean) {
        if (isCurrent && this.props.currentBreadcrumbRenderer != null) {
            return this.props.currentBreadcrumbRenderer(props);
        } else if (this.props.breadcrumbRenderer != null) {
            return this.props.breadcrumbRenderer(props);
        } else {
            return <Breadcrumb {...props} current={isCurrent} />;
        }
    }
}
