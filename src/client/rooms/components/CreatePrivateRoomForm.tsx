import React from "react";
import { Form } from "react-bootstrap";
import Select from "react-select";
import { ClassroomSessionData } from "../../../types";
import { ButtonWithLoadingProp } from "../../components";
import { CourseOptionType } from "../../types";

const isOptionType = (option: any): option is CourseOptionType => {
    return option?.value && option?.label;
};

type Props = {
    id?: string;
    roomName: string;
    description: string;
    courseCodes: Array<CourseOptionType>;
    selectedCourse?: CourseOptionType;
    setRoomName: React.Dispatch<React.SetStateAction<string>>;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    setCourseCodes: React.Dispatch<
        React.SetStateAction<Array<CourseOptionType>>
    >;
    setSelectedCourse: React.Dispatch<
        React.SetStateAction<CourseOptionType | undefined>
    >;
    requestIsLoading?: boolean;
    submitting?: boolean;
    onSubmit: (data: {
        name: string;
        description: string;
        course: string | undefined;
    }) => Promise<void>;
    submitText?: string;
    children?: React.ReactNode;
};

export const CreatePrivateRoomForm: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <Form
            className="mb-3"
            onSubmit={async (e: React.FormEvent<HTMLDivElement>) => {
                e.preventDefault();
                props.onSubmit({
                    name: props.roomName,
                    description: props.description,
                    course: props.selectedCourse?.value,
                });
            }}
        >
            <Form.Group>
                <Form.Label>Room Name</Form.Label>
                <Form.Control
                    className="mb-2"
                    id="inlineFormInput"
                    placeholder="Room name"
                    value={props.roomName}
                    onChange={(e) => {
                        props.setRoomName(e.target.value);
                    }}
                    required
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                    as="textarea"
                    value={props.description}
                    onChange={(e) => {
                        props.setDescription(e.target.value);
                    }}
                    disabled={props.submitting}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Course</Form.Label>
                <Select
                    options={props.courseCodes}
                    value={props.selectedCourse}
                    onChange={(option) => {
                        if (isOptionType(option)) {
                            props.setSelectedCourse(option);
                        } else {
                            props.setSelectedCourse(undefined);
                        }
                    }}
                    isDisabled={props.submitting}
                    isClearable
                />
            </Form.Group>
            <ButtonWithLoadingProp
                type="submit"
                invertLoader
                loading={props.submitting}
            >
                Create Private Room
            </ButtonWithLoadingProp>
            {props.children}
        </Form>
    );
};
