import React from "react";
import { Form } from "react-bootstrap";
import { TwitterPicker } from "react-color";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { ClassroomSessionData } from "../../../types";
import { ButtonWithLoadingProp, SimpleDatepicker } from "../../components";
import { CourseOptionType } from "../../types";
import { baseRoomTypeOptions } from "../../utils";

const isOptionType = (option: any): option is CourseOptionType => {
    return option?.value && option?.label;
};

type Props = {
    id?: string;
    roomName: string;
    description: string;
    courseCodes: Array<CourseOptionType>;
    selectedCourse?: CourseOptionType;
    roomType: CourseOptionType;
    startingTime: Date;
    endingTime: Date;
    colourCode: string;
    setRoomName: React.Dispatch<React.SetStateAction<string>>;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    setCourseCodes: React.Dispatch<
        React.SetStateAction<Array<CourseOptionType>>
    >;
    setSelectedCourse: React.Dispatch<
        React.SetStateAction<CourseOptionType | undefined>
    >;
    setRoomType: React.Dispatch<React.SetStateAction<CourseOptionType>>;
    setStartingTime: React.Dispatch<React.SetStateAction<Date>>;
    setEndingTime: React.Dispatch<React.SetStateAction<Date>>;
    setColourCode: React.Dispatch<React.SetStateAction<string>>;
    requestIsLoading?: boolean;
    submitting?: boolean;
    onSubmit: (
        data: Omit<ClassroomSessionData, "messages" | "id"> & { id?: string }
    ) => Promise<void>;
    submitText?: string;
};

export const ScheduleRoomForm: React.FunctionComponent<Props> = (
    props: Props
) => {
    const isCourseEmpty = React.useMemo(() => {
        return props.selectedCourse?.value === undefined;
    }, [props.selectedCourse]);

    return (
        <Form
            className="mb-3"
            onSubmit={async (e) => {
                e.preventDefault();
                props.onSubmit({
                    id: props.id,
                    name: props.roomName,
                    description: props.description,
                    roomType: props.roomType.value,
                    courseCode: props.selectedCourse!.value,
                    startTime: props.startingTime.toISOString(),
                    endTime: props.endingTime.toISOString(),
                    colourCode: props.colourCode,
                });
            }}
        >
            <Form.Group>
                <Form.Label>Room name</Form.Label>
                <Form.Control
                    type="text"
                    value={props.roomName}
                    onChange={(e) => {
                        props.setRoomName(e.target.value);
                    }}
                    required
                    disabled={props.submitting}
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
                <Form.Label>Type</Form.Label>
                <CreatableSelect
                    options={baseRoomTypeOptions}
                    value={props.roomType}
                    onChange={(option) => {
                        if (isOptionType(option)) {
                            props.setRoomType(option);
                        }
                    }}
                    isDisabled={props.submitting}
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
                        }
                    }}
                    isDisabled={props.submitting}
                    required
                    styles={{
                        control: (style) => ({
                            ...style,
                            borderColor: isCourseEmpty ? "red" : "initial",
                        }),
                    }}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Class start time</Form.Label>
                <SimpleDatepicker
                    time={props.startingTime}
                    onChange={(time) => {
                        props.setStartingTime(time);
                    }}
                    disabled={props.submitting}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Class end time</Form.Label>
                <SimpleDatepicker
                    time={props.endingTime}
                    onChange={(time) => {
                        props.setEndingTime(time);
                    }}
                    disabled={props.submitting}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Room colour code</Form.Label>
                <div className="d-flex justify-content-center">
                    <TwitterPicker
                        triangle="hide"
                        color={props.colourCode}
                        onChangeComplete={(colour) => {
                            props.setColourCode(colour.hex);
                        }}
                    />
                </div>
            </Form.Group>
            <ButtonWithLoadingProp
                variant="primary"
                type="submit"
                loading={props.requestIsLoading}
                disabled={props.submitting || props.requestIsLoading}
                invertLoader
                style={{
                    backgroundColor: props.colourCode,
                }}
            >
                {props.submitText ? props.submitText : "Create"}
            </ButtonWithLoadingProp>
        </Form>
    );
};
